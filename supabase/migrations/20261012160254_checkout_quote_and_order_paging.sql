-- Replace the old overload so every new checkout must confirm its displayed total.
drop function public.create_checkout_order(jsonb,jsonb,uuid,text);

create function public.create_checkout_order(
 p_customer jsonb,p_items jsonb,p_key uuid,p_hash text,p_expected_total numeric
) returns jsonb language plpgsql security invoker set search_path=public as $$
declare existing orders%rowtype; product products%rowtype; entry jsonb; packed jsonb:='[]'; sub numeric:=0;fee numeric;new_order orders%rowtype;qty integer;seen uuid[]:='{}';
begin
 if p_key is null or p_hash is null then raise exception 'Invalid checkout request.';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
 select * into existing from orders where idempotency_key=p_key;
 if found then
   if existing.request_hash<>p_hash then raise exception 'Your basket changed. Please retry checkout.';end if;
   return jsonb_build_object('id',existing.id,'subtotal',existing.subtotal,'delivery_fee',existing.delivery_fee,'total_amount',existing.total_amount);
 end if;
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
 insert into orders(customer_name,customer_phone,delivery_area,delivery_address,items,subtotal,delivery_fee,total_amount,idempotency_key,request_hash)
 values(p_customer->>'customer_name',p_customer->>'customer_phone',p_customer->>'delivery_area',p_customer->>'delivery_address',packed,sub,fee,sub+fee,p_key,p_hash) returning * into new_order;
 return jsonb_build_object('id',new_order.id,'subtotal',sub,'delivery_fee',fee,'total_amount',sub+fee);
end $$;
revoke execute on function public.create_checkout_order(jsonb,jsonb,uuid,text,numeric) from public,anon,authenticated;
grant execute on function public.create_checkout_order(jsonb,jsonb,uuid,text,numeric) to service_role;

-- Both columns are needed: many orders may have exactly the same timestamp.
create index orders_created_id_idx on public.orders(created_at desc,id desc);
create function public.list_store_orders(p_before timestamptz default null,p_before_id text default null,p_limit integer default 201)
returns setof public.orders language sql stable security invoker set search_path=public as $$
 select * from orders
 where p_before is null or (created_at,id)<(p_before,p_before_id)
 order by created_at desc,id desc
 limit greatest(1,least(coalesce(p_limit,201),201));
$$;
revoke execute on function public.list_store_orders(timestamptz,text,integer) from public,anon,authenticated;
grant execute on function public.list_store_orders(timestamptz,text,integer) to service_role;

create or replace function public.today_metrics() returns jsonb language sql stable security invoker set search_path=public as $$
 select jsonb_build_object('gross_revenue',coalesce(sum(total_amount),0),'order_count',count(*),'collected_cod',coalesce(sum(total_amount) filter(where status='Delivered'),0),'estimated_profit_share',coalesce(sum(subtotal),0)*0.10*0.50)
 from orders
 where created_at>=((date_trunc('day',now() at time zone 'Asia/Karachi')) at time zone 'Asia/Karachi')
 and created_at<((date_trunc('day',now() at time zone 'Asia/Karachi')+interval '1 day') at time zone 'Asia/Karachi');
$$;
