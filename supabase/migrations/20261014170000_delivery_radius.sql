-- New orders require an explicit customer pin inside the store's 5 km radius.
-- Existing orders retain their original address and continue to be fulfillable.
alter table public.orders add column delivery_latitude double precision,
 add column delivery_longitude double precision,add column delivery_distance_km numeric(7,3);
alter table public.orders add constraint orders_delivery_pin_check check (
 (delivery_latitude is null and delivery_longitude is null and delivery_distance_km is null)
 or (delivery_latitude is not null and delivery_longitude is not null and delivery_distance_km is not null
 and delivery_latitude between -90 and 90 and delivery_longitude between -180 and 180 and delivery_distance_km between 0 and 5));
create function public.delivery_distance_km(p_lat double precision,p_lng double precision)
returns double precision language sql immutable strict security invoker set search_path=public as $$
 select 6371*2*asin(sqrt(least(1.0,greatest(0.0,
 power(sin(radians(p_lat-31.41216075)/2),2)+cos(radians(31.41216075))*cos(radians(p_lat))*power(sin(radians(p_lng-74.27587375)/2),2)))));
$$;
revoke execute on function public.delivery_distance_km(double precision,double precision) from public,anon,authenticated;
grant execute on function public.delivery_distance_km(double precision,double precision) to service_role;

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
 if distance_km>5+1e-9 then raise exception 'Sorry, we deliver only within 5 km of our PGECHS Phase 1 store.';end if;
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

