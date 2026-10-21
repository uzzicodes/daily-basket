-- Individual staff identities and atomic order work. All API access stays server-only.
create table public.store_staff (
 id uuid primary key default gen_random_uuid(), username text not null unique check(username ~ '^[a-z0-9][a-z0-9._-]{2,39}$'),
 display_name text not null check(length(display_name) between 2 and 80), role text not null check(role in ('manager','packer','rider')),
 credential_salt text not null, credential_hash text not null, active boolean not null default true,
 auth_version integer not null default 1 check(auth_version>0), created_at timestamptz not null default now()
);
create table public.store_product_costs (
 product_id uuid primary key references public.products(id) on delete cascade, unit_cost numeric(12,2) not null check(unit_cost>=0), updated_at timestamptz not null default now()
);
create table public.store_order_costs (
 order_id text not null references public.orders(id) on delete cascade, product_id uuid not null,
 quantity integer not null check(quantity between 1 and 99), unit_cost numeric(12,2) check(unit_cost>=0), primary key(order_id,product_id)
);
create table public.store_order_finance (
 order_id text primary key references public.orders(id) on delete cascade, delivery_cost numeric(12,2) check(delivery_cost>=0), updated_at timestamptz not null default now()
);
create table public.store_expenses (
 id uuid primary key default gen_random_uuid(), request_key uuid not null unique, expense_date date not null,
 amount numeric(12,2) not null check(amount>0), category text not null check(length(category) between 2 and 60),
 note text not null check(length(note) between 2 and 400), created_at timestamptz not null default now()
);
create table public.store_audit_events (
 id uuid primary key default gen_random_uuid(), order_id text references public.orders(id) on delete cascade,
 actor_staff_id uuid references public.store_staff(id), actor_role text not null check(actor_role in ('owner','manager','packer','rider')),
 action text not null, detail jsonb not null default '{}', created_at timestamptz not null default now()
);
alter table public.orders add column operation_version integer not null default 0;
alter table public.orders add column approval_status text not null default 'pending' check(approval_status in ('pending','approved','rejected'));
alter table public.orders add column approved_at timestamptz;
alter table public.orders add column packed_at timestamptz;
alter table public.orders add column assigned_rider_id uuid references public.store_staff(id);
alter table public.orders add column delivered_at timestamptz;
alter table public.orders add column cash_confirmed boolean not null default false;
alter table public.orders add column cash_received numeric(12,2) check(cash_received>=0);
alter table public.orders add column settled_at timestamptz;
alter table public.orders add column rejection_reason text;
alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check check(status in ('Pending','Packing','Out for Delivery','Delivered','Cancelled'));
-- Existing orders predate approval. Preserve their previously authorized workflow/cash state.
-- Do not invent historical approval, delivery or cash-receipt timestamps.
update public.orders set approval_status='approved',cash_confirmed=(status='Delivered'),cash_received=case when status='Delivered' then total_amount end;
create index store_staff_role_active_idx on public.store_staff(role,active);
create index orders_assigned_rider_idx on public.orders(assigned_rider_id,created_at desc);
create index store_audit_order_time_idx on public.store_audit_events(order_id,created_at desc);
create index store_audit_actor_idx on public.store_audit_events(actor_staff_id);
create index store_expenses_date_idx on public.store_expenses(expense_date desc);

alter table public.store_staff enable row level security;
alter table public.store_product_costs enable row level security;
alter table public.store_order_costs enable row level security;
alter table public.store_order_finance enable row level security;
alter table public.store_expenses enable row level security;
alter table public.store_audit_events enable row level security;
revoke all on public.store_staff,public.store_product_costs,public.store_order_costs,public.store_order_finance,public.store_expenses,public.store_audit_events from public,anon,authenticated;
grant select,insert,update,delete on public.store_staff,public.store_product_costs,public.store_order_costs,public.store_order_finance,public.store_expenses,public.store_audit_events to service_role;

create function public.snapshot_store_costs() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 insert into public.store_order_costs(order_id,product_id,quantity,unit_cost)
 select new.id,(item->>'product_id')::uuid,(item->>'quantity')::integer,c.unit_cost
 from jsonb_array_elements(new.items) item left join public.store_product_costs c on c.product_id=(item->>'product_id')::uuid;
 insert into public.store_order_finance(order_id) values(new.id);
 return new;
end $$;
create trigger snapshot_store_order_costs after insert on public.orders for each row execute function public.snapshot_store_costs();
insert into public.store_order_costs(order_id,product_id,quantity,unit_cost)
select o.id,(item->>'product_id')::uuid,(item->>'quantity')::integer,null from public.orders o cross join lateral jsonb_array_elements(o.items) item;
insert into public.store_order_finance(order_id) select id from public.orders;

create function public.perform_store_order_action(p_order_id text,p_action text,p_expected_version integer,p_role text,p_staff_id uuid default null,p_payload jsonb default '{}')
returns jsonb language plpgsql security invoker set search_path='' as $$
declare o public.orders%rowtype; staff_role text; rider uuid; amount numeric; checks jsonb; reason text;
begin
 if p_role is null or p_role not in ('owner','manager','packer','rider') then raise exception 'Access denied';end if;
 if p_staff_id is not null then
  select role into staff_role from public.store_staff where id=p_staff_id and active for share;
  if not found or staff_role<>p_role then raise exception 'Staff access was revoked';end if;
 elsif p_role not in ('owner','packer') then raise exception 'Individual staff identity required';end if;
 select * into o from public.orders where id=p_order_id for update;
 if not found then raise exception 'Order not found';end if;
 if p_expected_version is null or o.operation_version<>p_expected_version then raise exception 'Order changed. Refresh before trying again';end if;
 if p_role='rider' and o.assigned_rider_id is distinct from p_staff_id then raise exception 'This order is not assigned to you';end if;
 if p_action='approve' then
  if p_role not in ('manager','owner') then raise exception 'Only the manager can approve bills';end if;
  if o.status<>'Pending' or o.approval_status<>'pending' then raise exception 'Order is no longer awaiting approval';end if;
  update public.orders set approval_status='approved',approved_at=now() where id=o.id;
 elsif p_action='reject' then
  if p_role not in ('manager','owner') then raise exception 'Only the manager can reject orders';end if;
  reason=trim(coalesce(p_payload->>'reason',''));
  if length(reason) not between 3 and 400 then raise exception 'Enter the reason for rejecting this order';end if;
  if o.status<>'Pending' or o.approval_status<>'pending' then raise exception 'Only orders awaiting approval can be rejected';end if;
  update public.orders set status='Cancelled',approval_status='rejected',rejection_reason=reason where id=o.id;
 elsif p_action='start_pack' then
  if p_role not in ('packer','manager','owner') then raise exception 'Packing access required';end if;
  if o.status<>'Pending' or o.approval_status<>'approved' then raise exception 'The manager must approve this bill before packing';end if;
  update public.orders set status='Packing' where id=o.id;
 elsif p_action='finish_pack' then
  if p_role not in ('packer','manager','owner') then raise exception 'Packing access required';end if;
  if o.status<>'Packing' or o.packed_at is not null then raise exception 'Order is not awaiting packing';end if;
  checks=p_payload->'checked_items';
  if checks is null or jsonb_typeof(checks)<>'array' or jsonb_array_length(checks)<>jsonb_array_length(o.items) then raise exception 'Check every product and quantity before marking ready';end if;
  if (select count(distinct item->>'product_id') from jsonb_array_elements(checks) item)<>jsonb_array_length(o.items) or exists(
   select 1 from jsonb_array_elements(o.items) expected where not exists(select 1 from jsonb_array_elements(checks) checked where checked->>'product_id'=expected->>'product_id' and checked->>'quantity'=expected->>'quantity')
  ) then raise exception 'Check every exact product and quantity before marking ready';end if;
  update public.orders set packed_at=now() where id=o.id;
 elsif p_action='assign_rider' then
  if p_role not in ('manager','owner') then raise exception 'Only the manager can assign riders';end if;
  if o.status not in ('Pending','Packing') or o.approval_status<>'approved' then raise exception 'Only approved orders waiting for dispatch can be assigned';end if;
  rider=(p_payload->>'rider_id')::uuid;
  perform 1 from public.store_staff where id=rider and role='rider' and active for share;
  if not found then raise exception 'Choose an active rider';end if;
  update public.orders set assigned_rider_id=rider where id=o.id;
 elsif p_action='depart' then
  if p_role not in ('rider','manager','owner') then raise exception 'Rider or manager access required';end if;
  if o.status<>'Packing' or o.packed_at is null or o.assigned_rider_id is null then raise exception 'Packing must be checked and a rider assigned before dispatch';end if;
  perform 1 from public.store_staff where id=o.assigned_rider_id and role='rider' and active for share;
  if not found then raise exception 'Assigned rider is no longer active';end if;
  update public.orders set status='Out for Delivery' where id=o.id;
 elsif p_action='deliver' then
  if p_role not in ('rider','manager','owner') then raise exception 'Rider or manager access required';end if;
  if o.status<>'Out for Delivery' then raise exception 'Order is not out for delivery';end if;
  update public.orders set status='Delivered',delivered_at=now() where id=o.id;
 elsif p_action='settle' then
  if p_role not in ('manager','owner') then raise exception 'Only the manager or owner can confirm returned cash';end if;
  if o.status not in ('Out for Delivery','Delivered') or o.cash_confirmed then raise exception 'This bill is not awaiting cash settlement';end if;
  amount=(p_payload->>'cash_received')::numeric;
  if amount is null or amount<>o.total_amount then raise exception 'The returned cash must match the bill exactly. Keep a short payment open for review';end if;
  update public.orders set status='Delivered',delivered_at=coalesce(delivered_at,now()),cash_confirmed=true,cash_received=amount,settled_at=now() where id=o.id;
 else raise exception 'Unknown order action';end if;
 update public.orders set operation_version=operation_version+1 where id=o.id returning * into o;
 insert into public.store_audit_events(order_id,actor_staff_id,actor_role,action,detail) values(o.id,p_staff_id,p_role,p_action,p_payload);
 return jsonb_build_object('id',o.id,'status',o.status,'operation_version',o.operation_version);
end $$;

create function public.save_store_order_costs(p_order_id text,p_costs jsonb,p_delivery_cost numeric,p_save_future boolean default false)
returns boolean language plpgsql security invoker set search_path='' as $$
declare o public.orders%rowtype; item jsonb;
begin
 select * into o from public.orders where id=p_order_id for update;if not found then raise exception 'Order not found';end if;
 if p_delivery_cost is null or p_delivery_cost<0 or p_delivery_cost>9999999999.99 then raise exception 'Enter the actual delivery cost, including zero when appropriate';end if;
 if p_costs is null or jsonb_typeof(p_costs)<>'array' or jsonb_array_length(p_costs)<>jsonb_array_length(o.items) or
 (select count(distinct i->>'product_id') from jsonb_array_elements(p_costs) i)<>jsonb_array_length(o.items) then raise exception 'Enter a cost for every exact product';end if;
 for item in select * from jsonb_array_elements(p_costs) loop
  if not exists(select 1 from public.store_order_costs where order_id=o.id and product_id=(item->>'product_id')::uuid) or
  (item->>'unit_cost') is null or (item->>'unit_cost')::numeric<0 or (item->>'unit_cost')::numeric>9999999999.99 then raise exception 'Invalid product cost';end if;
  update public.store_order_costs set unit_cost=(item->>'unit_cost')::numeric where order_id=o.id and product_id=(item->>'product_id')::uuid;
  if p_save_future then insert into public.store_product_costs(product_id,unit_cost) values((item->>'product_id')::uuid,(item->>'unit_cost')::numeric) on conflict(product_id) do update set unit_cost=excluded.unit_cost,updated_at=now();end if;
 end loop;
 update public.store_order_finance set delivery_cost=p_delivery_cost,updated_at=now() where order_id=o.id;
 insert into public.store_audit_events(order_id,actor_role,action,detail) values(o.id,'owner','save_costs',jsonb_build_object('delivery_cost',p_delivery_cost,'save_future',p_save_future));
 return true;
end $$;

create function public.store_business_summary(p_days integer default 30) returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare start_at timestamptz; result jsonb; expenses numeric;
begin
 if p_days not in (1,7,30,90,0) then raise exception 'Invalid reporting period';end if;
 start_at=case when p_days=0 then '-infinity'::timestamptz else (date_trunc('day',now() at time zone 'Asia/Karachi')-(p_days-1)*interval '1 day') at time zone 'Asia/Karachi' end;
 select coalesce(sum(amount),0) into expenses from public.store_expenses where expense_date>=case when p_days=0 then '-infinity'::date else (start_at at time zone 'Asia/Karachi')::date end and expense_date<=(now() at time zone 'Asia/Karachi')::date;
 with cost as(select order_id,sum(quantity*unit_cost) as purchase_cost,bool_and(unit_cost is not null) as complete from public.store_order_costs group by order_id),
 reporting as(select o.*,c.purchase_cost,(coalesce(c.complete,false) and f.delivery_cost is not null) as costs_complete,f.delivery_cost as rider_cost from public.orders o left join cost c on c.order_id=o.id left join public.store_order_finance f on f.order_id=o.id where o.created_at>=start_at and o.created_at<((date_trunc('day',now() at time zone 'Asia/Karachi')+interval '1 day') at time zone 'Asia/Karachi'))
 select jsonb_build_object(
  'order_count',count(*),'open_orders',count(*) filter(where status not in ('Delivered','Cancelled')),
  'placed_value',coalesce(sum(total_amount) filter(where status<>'Cancelled'),0),
  'sales',coalesce(sum(total_amount) filter(where status='Delivered'),0),'merchandise_sales',coalesce(sum(subtotal) filter(where status='Delivered'),0),
  'delivery_income',coalesce(sum(delivery_fee) filter(where status='Delivered'),0),'completed_count',count(*) filter(where status='Delivered'),
  'cash_received',coalesce(sum(cash_received) filter(where cash_confirmed),0),
  'cash_with_riders',coalesce(sum(total_amount) filter(where status='Delivered' and not cash_confirmed),0),
  'missing_cost_orders',count(*) filter(where status='Delivered' and not costs_complete),
  'known_order_profit',coalesce(sum(total_amount-purchase_cost-rider_cost) filter(where status='Delivered' and costs_complete),0),
  'recorded_profit',case when count(*) filter(where status='Delivered' and not costs_complete)>0 then null else coalesce(sum(total_amount-purchase_cost-rider_cost) filter(where status='Delivered'),0)-expenses end,
  'expenses',expenses,'period_days',p_days) into result from reporting;
 return result||jsonb_build_object('daily_sales',(select coalesce(jsonb_agg(row_to_json(d) order by d.day),'[]') from(
  select day::date::text as day,coalesce(sum(o.total_amount) filter(where o.status='Delivered'),0) as sales,count(o.id) as orders
  from generate_series((now() at time zone 'Asia/Karachi')::date-(least(case when p_days=0 then 30 else p_days end,30)-1), (now() at time zone 'Asia/Karachi')::date,interval '1 day') day
  left join public.orders o on (o.created_at at time zone 'Asia/Karachi')::date=day::date group by day
 )d));
end $$;

-- Legacy staff pagination continues to work, excluding cancelled/rejected orders.
create or replace function public.list_desk_orders(p_view text default 'active',p_before timestamptz default null,p_before_id text default null,p_limit integer default 201)
returns setof public.orders language sql stable security invoker set search_path=public as $$
 select * from orders where ((p_view='active' and status not in ('Delivered','Cancelled')) or (p_view='delivered' and status='Delivered'))
 and (p_before is null or (created_at,id)<(p_before,p_before_id)) order by created_at desc,id desc limit greatest(1,least(coalesce(p_limit,201),201));
$$;
revoke execute on function public.snapshot_store_costs(),public.perform_store_order_action(text,text,integer,text,uuid,jsonb),public.save_store_order_costs(text,jsonb,numeric,boolean),public.store_business_summary(integer) from public,anon,authenticated;
grant execute on function public.snapshot_store_costs(),public.perform_store_order_action(text,text,integer,text,uuid,jsonb),public.save_store_order_costs(text,jsonb,numeric,boolean),public.store_business_summary(integer) to service_role;
