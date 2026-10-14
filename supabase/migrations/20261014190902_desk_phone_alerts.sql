-- Private device registrations and a durable, per-device order alert queue.
create table public.desk_push_devices (
 id text primary key check (id ~ '^[a-f0-9]{64}$'),
 endpoint_hash text unique not null check (endpoint_hash ~ '^[a-f0-9]{64}$'),
 subscription jsonb not null,
 created_at timestamptz not null default now(),
 last_seen_at timestamptz not null default now()
);
create table public.desk_push_deliveries (
 id uuid primary key default gen_random_uuid(),
 order_id text not null references public.orders(id) on delete cascade,
 device_id text not null references public.desk_push_devices(id) on delete cascade on update cascade,
 status text not null default 'queued' check (status in ('queued','sending','sent','failed')),
 attempts integer not null default 0 check(attempts between 0 and 5),
 next_attempt_at timestamptz not null default now(),
 lease_until timestamptz,
 last_error text,
 created_at timestamptz not null default now(),
 accepted_at timestamptz,
 unique(order_id,device_id)
);
create index desk_push_due_idx on public.desk_push_deliveries(next_attempt_at) where status in ('queued','sending');
create index desk_push_device_idx on public.desk_push_deliveries(device_id);
alter table public.desk_push_devices enable row level security;
alter table public.desk_push_deliveries enable row level security;
revoke all on public.desk_push_devices, public.desk_push_deliveries from public,anon,authenticated;
grant all on public.desk_push_devices, public.desk_push_deliveries to service_role;

create function public.enqueue_desk_order_alert() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 insert into desk_push_deliveries(order_id,device_id)
 select new.id,id from desk_push_devices where last_seen_at>now()-interval '30 days'
 on conflict(order_id,device_id) do nothing;
 return new;
end $$;
revoke execute on function public.enqueue_desk_order_alert() from public,anon,authenticated;
grant execute on function public.enqueue_desk_order_alert() to service_role;
create trigger enqueue_desk_order_alert after insert on public.orders for each row execute function public.enqueue_desk_order_alert();

create function public.claim_desk_push_deliveries(p_limit integer default 12)
returns table(id uuid,order_id text,device_id text,subscription jsonb,line_count integer,attempts integer)
language plpgsql security invoker set search_path=public as $$
begin
 update desk_push_deliveries set status='failed',last_error='RETRY_LIMIT'
 where status='sending' and lease_until<now() and desk_push_deliveries.attempts>=5;
 return query
 with due as (
  select d.id from desk_push_deliveries d join desk_push_devices dev on dev.id=d.device_id
  where (d.status='queued' and d.next_attempt_at<=now() or d.status='sending' and d.lease_until<now())
  and d.attempts<5 and dev.last_seen_at>now()-interval '30 days'
  order by d.created_at,d.id limit least(greatest(p_limit,1),24) for update of d skip locked
 ), claimed as (
  update desk_push_deliveries d set status='sending',attempts=d.attempts+1,lease_until=now()+interval '2 minutes'
  from due where d.id=due.id returning d.*
 ) select c.id,c.order_id,c.device_id,dev.subscription,jsonb_array_length(o.items),c.attempts
 from claimed c join desk_push_devices dev on dev.id=c.device_id join orders o on o.id=c.order_id;
end $$;
revoke execute on function public.claim_desk_push_deliveries(integer) from public,anon,authenticated;
grant execute on function public.claim_desk_push_deliveries(integer) to service_role;
