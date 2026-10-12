-- Run once in the Supabase SQL editor. The service key stays on the server.
create extension if not exists pgcrypto;
create table public.products (
 id uuid primary key default gen_random_uuid(), name text not null, brand text not null,
 category text not null check (category in ('Cooking & Pantry','Dairy, Milk & Breakfast','Tea, Coffee & Beverages','Spices & Recipe Mixes','Snacks & Confectionery','Laundry & Detergents','Household & Cleaning','Baby Care','Personal Care & Hygiene')),
 price numeric(12,2) not null check(price>0), original_price numeric(12,2) not null check(original_price>=price),
 unit text not null,image_url text not null,rating numeric(2,1) not null check(rating between 0 and 5),in_stock boolean not null default true,created_at timestamptz not null default now()
);
create table public.orders (
 id text primary key default ('ORD-'||gen_random_uuid()::text),customer_name text not null,customer_phone text not null,
 delivery_area text not null,delivery_address text not null,items jsonb not null check(jsonb_typeof(items)='array'),
 subtotal numeric(12,2) not null check(subtotal>0),delivery_fee numeric(12,2) not null check(delivery_fee>=0),total_amount numeric(12,2) not null,
 payment_method text not null default 'Cash on Delivery' check(payment_method='Cash on Delivery'),
 status text not null default 'Pending' check(status in ('Pending','Packing','Out for Delivery','Delivered')),
 idempotency_key uuid not null unique,request_hash text not null,created_at timestamptz not null default now(),
 check(total_amount=subtotal+delivery_fee)
);
create index orders_created_idx on public.orders(created_at desc);
create index orders_status_idx on public.orders(status,created_at desc);
create table public.api_limits(key text primary key,window_started timestamptz not null default now(),attempts integer not null default 1);
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.api_limits enable row level security;
revoke all on public.products, public.orders,public.api_limits from anon,authenticated;
grant select,insert,update,delete on public.products,public.orders,public.api_limits to service_role;

create function public.consume_rate_limit(p_key text,p_limit integer,p_window_seconds integer) returns boolean language plpgsql set search_path=public as $$
declare count_now integer;
begin
 insert into api_limits as a(key) values(p_key)
 on conflict(key) do update set
 attempts=case when a.window_started<now()-make_interval(secs=>p_window_seconds) then 1 else a.attempts+1 end,
 window_started=case when a.window_started<now()-make_interval(secs=>p_window_seconds) then now() else a.window_started end
 returning attempts into count_now;
 return count_now<=p_limit;
end $$;

-- Authoritative prices and stock are read and frozen inside a single transaction.
create function public.create_checkout_order(p_customer jsonb,p_items jsonb,p_key uuid,p_hash text) returns jsonb language plpgsql set search_path=public as $$
declare existing orders%rowtype; product products%rowtype; entry jsonb; packed jsonb:='[]'; sub numeric:=0;fee numeric;new_order orders%rowtype;qty integer;seen uuid[]:='{}';
begin
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into existing from orders where idempotency_key=p_key;
 if found then
   if existing.request_hash<>p_hash then raise exception 'Your basket changed. Please retry checkout.';end if;
   return jsonb_build_object('id',existing.id,'total_amount',existing.total_amount);
 end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 1 and 60 then raise exception 'Invalid basket.';end if;
 for entry in select * from jsonb_array_elements(p_items) loop
   if (entry->>'quantity') !~ '^[0-9]+$' then raise exception 'Invalid quantity.';end if;
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
 insert into orders(customer_name,customer_phone,delivery_area,delivery_address,items,subtotal,delivery_fee,total_amount,idempotency_key,request_hash)
 values(p_customer->>'customer_name',p_customer->>'customer_phone',p_customer->>'delivery_area',p_customer->>'delivery_address',packed,sub,fee,sub+fee,p_key,p_hash) returning * into new_order;
 return jsonb_build_object('id',new_order.id,'subtotal',sub,'delivery_fee',fee,'total_amount',sub+fee);
end $$;

create function public.today_metrics() returns jsonb language sql stable set search_path=public as $$
 select jsonb_build_object('gross_revenue',coalesce(sum(total_amount),0),'order_count',count(*),'collected_cod',coalesce(sum(total_amount) filter(where status='Delivered'),0),'estimated_profit_share',coalesce(sum(subtotal),0)*0.10*0.50)
 from orders where created_at>=((date_trunc('day',now() at time zone 'Asia/Karachi')) at time zone 'Asia/Karachi');
$$;
revoke execute on function public.consume_rate_limit(text,integer,integer),public.create_checkout_order(jsonb,jsonb,uuid,text),public.today_metrics() from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer),public.create_checkout_order(jsonb,jsonb,uuid,text),public.today_metrics() to service_role;
-- Remove stale rate-limit keys periodically, e.g. via a Supabase scheduled task:
-- delete from public.api_limits where window_started < now()-interval '1 day';
