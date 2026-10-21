-- Owner-only, reversible test-report exclusions. Receipts and order states are retained.
create table public.store_report_resets(id uuid primary key,created_at timestamptz not null default now(),restored_at timestamptz,order_count integer not null,sales numeric not null);
create table public.store_report_exclusions(order_id text primary key references public.orders(id) on delete cascade,reset_id uuid not null references public.store_report_resets(id));
create index store_report_exclusions_reset_idx on public.store_report_exclusions(reset_id);
alter table public.store_report_resets enable row level security;
alter table public.store_report_exclusions enable row level security;
revoke all on public.store_report_resets,public.store_report_exclusions from public,anon,authenticated;
grant select,insert,update,delete on public.store_report_resets,public.store_report_exclusions to service_role;
create function public.preview_store_report_reset() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object('order_count',count(*),'completed_count',count(*) filter(where o.status='Delivered'),'sales',coalesce(sum(o.total_amount) filter(where o.status='Delivered'),0),
 'snapshot',md5(coalesce(string_agg(o.id||':'||o.operation_version::text,',' order by o.id),'')),
 'excluded_count',(select count(*) from public.store_report_exclusions),
 'last_reset',(select jsonb_build_object('id',id,'order_count',order_count,'sales',sales,'created_at',created_at) from public.store_report_resets where restored_at is null order by created_at desc,id desc limit 1))
 from public.orders o where not exists(select 1 from public.store_report_exclusions x where x.order_id=o.id);
$$;
create function public.reset_store_test_reports(p_request_id uuid,p_snapshot text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare state jsonb; previous public.store_report_resets%rowtype;
begin
 perform pg_advisory_xact_lock(20261021,7);
 select * into previous from public.store_report_resets where id=p_request_id;
 if found then if previous.restored_at is not null then raise exception 'This reset was restored. Refresh before trying again.';end if;return jsonb_build_object('id',previous.id,'order_count',previous.order_count);end if;
 lock table public.orders in share mode;
 state:=public.preview_store_report_reset();
 if p_snapshot is distinct from state->>'snapshot' then raise exception 'Orders changed. Review the current totals before resetting.';end if;
 if (state->>'order_count')::integer=0 then raise exception 'There are no included orders to reset.';end if;
 insert into public.store_report_resets(id,order_count,sales) values(p_request_id,(state->>'order_count')::integer,(state->>'sales')::numeric);
 insert into public.store_report_exclusions(order_id,reset_id) select o.id,p_request_id from public.orders o where not exists(select 1 from public.store_report_exclusions x where x.order_id=o.id);
 insert into public.store_audit_events(actor_role,action,detail) values('owner','exclude_test_reports',jsonb_build_object('reset_id',p_request_id,'order_count',state->'order_count','sales',state->'sales'));
 return jsonb_build_object('id',p_request_id,'order_count',state->'order_count');
end $$;
create function public.restore_store_test_reports(p_reset_id uuid) returns boolean language plpgsql security invoker set search_path='' as $$
declare previous public.store_report_resets%rowtype;
begin
 perform pg_advisory_xact_lock(20261021,7);
 select * into previous from public.store_report_resets where id=p_reset_id for update;
 if not found then raise exception 'Reset not found.';end if;
 if previous.restored_at is not null then return true;end if;
 delete from public.store_report_exclusions where reset_id=p_reset_id;
 update public.store_report_resets set restored_at=now() where id=p_reset_id;
 insert into public.store_audit_events(actor_role,action,detail) values('owner','restore_test_reports',jsonb_build_object('reset_id',p_reset_id,'order_count',previous.order_count));
 return true;
end $$;
revoke execute on function public.preview_store_report_reset(),public.reset_store_test_reports(uuid,text),public.restore_store_test_reports(uuid) from public,anon,authenticated;
grant execute on function public.preview_store_report_reset(),public.reset_store_test_reports(uuid,text),public.restore_store_test_reports(uuid) to service_role;
create or replace function public.store_business_summary(p_days integer default 30) returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare start_at timestamptz; result jsonb; expenses numeric;
begin
 if p_days not in (1,7,30,90,0) then raise exception 'Invalid reporting period';end if;
 start_at=case when p_days=0 then '-infinity'::timestamptz else (date_trunc('day',now() at time zone 'Asia/Karachi')-(p_days-1)*interval '1 day') at time zone 'Asia/Karachi' end;
 select coalesce(sum(amount),0) into expenses from public.store_expenses where expense_date>=case when p_days=0 then '-infinity'::date else (start_at at time zone 'Asia/Karachi')::date end and expense_date<=(now() at time zone 'Asia/Karachi')::date;
 with cost as(select order_id,sum(quantity*unit_cost) as purchase_cost,bool_and(unit_cost is not null) as complete from public.store_order_costs group by order_id),
 reporting as(select o.*,c.purchase_cost,(coalesce(c.complete,false) and f.delivery_cost is not null) as costs_complete,f.delivery_cost as rider_cost from public.orders o left join cost c on c.order_id=o.id left join public.store_order_finance f on f.order_id=o.id where not exists(select 1 from public.store_report_exclusions x where x.order_id=o.id) and o.created_at>=start_at and o.created_at<((date_trunc('day',now() at time zone 'Asia/Karachi')+interval '1 day') at time zone 'Asia/Karachi'))
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
  'expenses',expenses,'period_days',p_days,'excluded_test_orders',(select count(*) from public.store_report_exclusions)) into result from reporting;
 return result||jsonb_build_object('daily_sales',(select coalesce(jsonb_agg(row_to_json(d) order by d.day),'[]') from(
  select day::date::text as day,coalesce(sum(o.total_amount) filter(where o.status='Delivered'),0) as sales,count(o.id) as orders
  from generate_series((now() at time zone 'Asia/Karachi')::date-(least(case when p_days=0 then 30 else p_days end,30)-1), (now() at time zone 'Asia/Karachi')::date,interval '1 day') day
  left join public.orders o on (o.created_at at time zone 'Asia/Karachi')::date=day::date and not exists(select 1 from public.store_report_exclusions x where x.order_id=o.id) group by day
 )d));
end $$;


-- The owner's final choice is a 7 km straight-line radius, not driving distance.
alter table public.orders drop constraint orders_delivery_pin_check;
alter table public.orders add constraint orders_delivery_pin_check check ((delivery_latitude is null and delivery_longitude is null and delivery_distance_km is null) or (delivery_latitude is not null and delivery_longitude is not null and delivery_distance_km is not null and delivery_latitude between -90 and 90 and delivery_longitude between -180 and 180 and delivery_distance_km between 0 and 7));
create or replace function public.create_checkout_order(
 p_customer jsonb,p_items jsonb,p_key uuid,p_hash text,p_expected_total numeric
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare existing orders%rowtype; product products%rowtype; entry jsonb; packed jsonb:='[]'; sub numeric:=0;fee numeric;new_order orders%rowtype;qty integer;seen uuid[]:='{}'; lat double precision; lng double precision; distance_km double precision;
begin
 if p_key is null or p_hash is null then raise exception 'Invalid checkout request.';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into existing from orders where idempotency_key=p_key;
 if found then
   if existing.request_hash<>p_hash then raise exception 'Your basket changed. Please retry checkout.';end if;
   return jsonb_build_object('id',existing.id,'subtotal',existing.subtotal,'delivery_fee',existing.delivery_fee,'total_amount',existing.total_amount);
 end if;
 if jsonb_typeof(p_customer->'delivery_latitude') is distinct from 'number' or jsonb_typeof(p_customer->'delivery_longitude') is distinct from 'number' then raise exception 'Choose your delivery pin before ordering.';end if;
 lat:=(p_customer->>'delivery_latitude')::double precision;lng:=(p_customer->>'delivery_longitude')::double precision;
 if not (lat between -90 and 90 and lng between -180 and 180) then raise exception 'Invalid delivery pin.';end if;
 distance_km:=public.delivery_distance_km(lat,lng);
 if distance_km>7+1e-9 then raise exception 'Sorry, we deliver only within 7 km of our PGECHS Phase 1 store.';end if;
 if jsonb_typeof(p_items) is distinct from 'array' then raise exception 'Invalid basket.';end if;
 if jsonb_array_length(p_items) not between 1 and 60 then raise exception 'Invalid basket.';end if;
 for entry in select * from jsonb_array_elements(p_items) loop
   if coalesce(entry->>'quantity','') !~ '^[0-9]{1,2}$' then raise exception 'Invalid quantity.';end if;
   qty:=(entry->>'quantity')::integer;
   if qty not between 1 and 99 then raise exception 'Invalid quantity.';end if;
   select * into product from products where id=(entry->>'product_id')::uuid for share;
   if not found or not product.in_stock then raise exception 'An item is unavailable. Refresh your basket.';end if;
   if product.id=any(seen) then raise exception 'Duplicate product in basket.';end if;
   seen:=array_append(seen,product.id);
   sub:=sub+product.price*qty;
   packed:=packed||jsonb_build_array(jsonb_build_object('product_id',product.id,'name',product.name,'unit',product.unit,'image_url',product.image_url,'quantity',qty,'price',product.price));
 end loop;
 fee:=case when sub>=2999 then 0 else 150 end;
 if p_expected_total is null or p_expected_total<>sub+fee then
   raise exception 'Prices have changed. Refresh prices and review your basket before ordering.';
 end if;
 insert into orders(customer_name,customer_phone,delivery_area,delivery_address,delivery_latitude,delivery_longitude,delivery_distance_km,items,subtotal,delivery_fee,total_amount,idempotency_key,request_hash)
 values(p_customer->>'customer_name',p_customer->>'customer_phone',p_customer->>'delivery_area',p_customer->>'delivery_address',lat,lng,round(distance_km::numeric,3),packed,sub,fee,sub+fee,p_key,p_hash) returning * into new_order;
 return jsonb_build_object('id',new_order.id,'subtotal',sub,'delivery_fee',fee,'total_amount',sub+fee);
end $$;
revoke execute on function public.create_checkout_order(jsonb,jsonb,uuid,text,numeric) from public,anon,authenticated;
grant execute on function public.create_checkout_order(jsonb,jsonb,uuid,text,numeric) to service_role;

