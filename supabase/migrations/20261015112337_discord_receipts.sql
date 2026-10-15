-- One private delivery record per newly saved order. Existing orders are not replayed.
create table public.discord_receipt_deliveries (
 order_id text primary key references public.orders(id) on delete cascade,
 status text not null default 'queued' check(status in ('queued','sending','sent','failed')),
 attempts integer not null default 0 check(attempts between 0 and 5),
 next_attempt_at timestamptz not null default now(),
 lease_until timestamptz,
 message_id text,
 last_error text,
 created_at timestamptz not null default now(),
 accepted_at timestamptz
);
create index discord_receipt_due_idx on public.discord_receipt_deliveries(next_attempt_at) where status in ('queued','sending');
alter table public.discord_receipt_deliveries enable row level security;
revoke all on public.discord_receipt_deliveries from public,anon,authenticated;
grant all on public.discord_receipt_deliveries to service_role;
create function public.enqueue_discord_receipt() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 insert into public.discord_receipt_deliveries(order_id) values(new.id) on conflict(order_id) do nothing;
 return new;
end $$;
revoke all on function public.enqueue_discord_receipt() from public,anon,authenticated;
grant execute on function public.enqueue_discord_receipt() to service_role;
create trigger enqueue_discord_receipt after insert on public.orders for each row execute function public.enqueue_discord_receipt();
create function public.claim_discord_receipts(p_limit integer default 4)
returns table(order_id text,attempts integer,receipt jsonb)
language plpgsql security invoker set search_path='' as $$
begin
 update public.discord_receipt_deliveries set status='failed',last_error='RETRY_LIMIT',lease_until=null
 where status='sending' and lease_until<now() and discord_receipt_deliveries.attempts>=5;
 return query with due as (
  select d.order_id from public.discord_receipt_deliveries d
  where ((d.status='queued' and d.next_attempt_at<=now()) or (d.status='sending' and d.lease_until<now())) and d.attempts<5
  order by d.created_at,d.order_id limit least(greatest(p_limit,1),8) for update skip locked
 ), claimed as (
  update public.discord_receipt_deliveries d set status='sending',attempts=d.attempts+1,lease_until=now()+interval '2 minutes'
  from due where d.order_id=due.order_id returning d.order_id,d.attempts
 ) select c.order_id,c.attempts,jsonb_build_object('id',o.id,'created_at',o.created_at,'customer_name',o.customer_name,'customer_phone',o.customer_phone,'delivery_area',o.delivery_area,'delivery_address',o.delivery_address,'items',o.items,'subtotal',o.subtotal,'delivery_fee',o.delivery_fee,'total_amount',o.total_amount,'status',o.status,'payment_method',o.payment_method)
 from claimed c join public.orders o on o.id=c.order_id;
end $$;
revoke all on function public.claim_discord_receipts(integer) from public,anon,authenticated;
grant execute on function public.claim_discord_receipts(integer) to service_role;
