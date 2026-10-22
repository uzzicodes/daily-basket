-- Packed orders become available for rider pickup automatically. Pickup claims and dispatches atomically; packers never assign or dispatch.
create or replace function public.perform_store_order_action(p_order_id text,p_action text,p_expected_version integer,p_role text,p_staff_id uuid default null,p_payload jsonb default '{}')
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
 if p_role='rider' and o.assigned_rider_id is distinct from p_staff_id and not (p_action='depart' and o.assigned_rider_id is null and o.status='Packing' and o.packed_at is not null) then raise exception 'This order is not assigned to you';end if;
 if p_action='approve' then
  raise exception 'Incoming orders do not require approval'; elsif p_action='reject' then
  if p_role not in ('manager','owner') then raise exception 'Only the manager or owner can cancel orders';end if;
  reason=trim(coalesce(p_payload->>'reason',''));
  if length(reason) not between 3 and 400 then raise exception 'Enter the reason for cancelling this order';end if;
  if o.status not in ('Pending','Packing') then raise exception 'Only orders waiting for dispatch can be cancelled';end if;
  update public.orders set status='Cancelled',approval_status='rejected',rejection_reason=reason where id=o.id;
 elsif p_action='start_pack' then
  if p_role not in ('packer','owner') then raise exception 'Packing access required';end if;
  if o.status<>'Pending' or o.approval_status='rejected' then raise exception 'This order is not awaiting packing';end if;
  update public.orders set status='Packing' where id=o.id;
 elsif p_action='finish_pack' then
  if p_role not in ('packer','owner') then raise exception 'Packing access required';end if;
  if o.status not in ('Pending','Packing') or o.approval_status='rejected' or o.packed_at is not null then raise exception 'Order is not awaiting packing';end if;
  checks=p_payload->'checked_items';
  if checks is null or jsonb_typeof(checks)<>'array' or jsonb_array_length(checks)<>jsonb_array_length(o.items) then raise exception 'Check every product and quantity before marking ready';end if;
  if (select count(distinct item->>'product_id') from jsonb_array_elements(checks) item)<>jsonb_array_length(o.items) or exists(
   select 1 from jsonb_array_elements(o.items) expected where not exists(select 1 from jsonb_array_elements(checks) checked where checked->>'product_id'=expected->>'product_id' and checked->>'quantity'=expected->>'quantity')
  ) then raise exception 'Check every exact product and quantity before marking ready';end if;
  update public.orders set status='Packing',packed_at=now() where id=o.id;
 elsif p_action='assign_rider' then
  if p_role<>'owner' then raise exception 'Only the owner can override rider assignment';end if;
  if o.status not in ('Pending','Packing') then raise exception 'Only orders waiting for dispatch can be assigned';end if;
  rider=(p_payload->>'rider_id')::uuid;
  perform 1 from public.store_staff where id=rider and role='rider' and active for share;
  if not found then raise exception 'Choose an active rider';end if;
  update public.orders set assigned_rider_id=rider where id=o.id;
 elsif p_action='depart' then
  if p_role not in ('rider','owner') then raise exception 'Only a rider can pick up a packed order';end if;
  if o.status<>'Packing' or o.packed_at is null then raise exception 'Packing must be checked before rider pickup';end if;
  rider=case when p_role='rider' then p_staff_id else o.assigned_rider_id end;
  if rider is null then raise exception 'An active rider must pick up this order';end if;
  perform 1 from public.store_staff where id=rider and role='rider' and active for share;
  if not found then raise exception 'Assigned rider is no longer active';end if;
  update public.orders set status='Out for Delivery',assigned_rider_id=rider where id=o.id;
 elsif p_action='deliver' then
  if p_role not in ('rider','owner') then raise exception 'Rider access required';end if;
  if o.status<>'Out for Delivery' then raise exception 'Order is not out for delivery';end if;
  update public.orders set status='Delivered',delivered_at=now() where id=o.id;
 elsif p_action='settle' then
  if p_role not in ('manager','owner') then raise exception 'Only the manager or owner can confirm returned cash';end if;
  if o.cash_confirmed then raise exception 'This bill is not awaiting cash settlement';end if;
  if o.status<>'Delivered' then raise exception 'Delivery must be reported before confirming payment';end if;
  if (p_payload->'delivery_verified') is distinct from 'true'::jsonb then raise exception 'Verify delivery and returned cash before closing this bill';end if;
  amount=(p_payload->>'cash_received')::numeric;
  if amount is null or amount<>o.total_amount then raise exception 'The returned cash must match the bill exactly. Keep a short payment open for review';end if;
  update public.orders set cash_confirmed=true,cash_received=amount,settled_at=now() where id=o.id;
 else raise exception 'Unknown order action';end if;
 update public.orders set operation_version=operation_version+1 where id=o.id returning * into o;
 insert into public.store_audit_events(order_id,actor_staff_id,actor_role,action,detail) values(o.id,p_staff_id,p_role,p_action,p_payload);
 return jsonb_build_object('id',o.id,'status',o.status,'operation_version',o.operation_version);
end $$;

