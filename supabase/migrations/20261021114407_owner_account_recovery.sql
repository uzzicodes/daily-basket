create table public.store_owner_credentials (
 singleton boolean primary key default true check(singleton),
 credential_salt text, credential_hash text,
 auth_version integer not null default 1 check(auth_version>0),
 updated_at timestamptz not null default now(),
 check((credential_salt is null)=(credential_hash is null))
);
insert into public.store_owner_credentials(singleton) values(true);
create table public.store_owner_resets (
 id uuid primary key default gen_random_uuid(), token_hash text not null unique check(length(token_hash)=64),
 auth_version integer not null, expires_at timestamptz not null, used_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.store_owner_credentials enable row level security;
alter table public.store_owner_resets enable row level security;
revoke all on public.store_owner_credentials,public.store_owner_resets from public,anon,authenticated;
grant select,insert,update,delete on public.store_owner_credentials,public.store_owner_resets to service_role;
create function public.replace_store_owner_password(p_version integer,p_salt text,p_hash text,p_reset_hash text default null)
returns integer language plpgsql security invoker set search_path='' as $$
declare account public.store_owner_credentials%rowtype; reset public.store_owner_resets%rowtype;
begin
 select * into account from public.store_owner_credentials where singleton for update;
 if not found or account.auth_version is distinct from p_version then raise exception 'Owner account changed. Sign in again';end if;
 if p_salt is null or length(p_salt)<20 or p_hash is null or p_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid password credential';end if;
 if p_reset_hash is not null then
  select * into reset from public.store_owner_resets where token_hash=p_reset_hash for update;
  if not found or reset.used_at is not null or reset.expires_at<=now() or reset.auth_version<>account.auth_version then raise exception 'Reset link is expired or already used';end if;
 end if;
 update public.store_owner_credentials set credential_salt=p_salt,credential_hash=p_hash,auth_version=auth_version+1,updated_at=now() where singleton;
 update public.store_owner_resets set used_at=now() where used_at is null;
 insert into public.store_audit_events(actor_role,action) values('owner',case when p_reset_hash is null then 'change_owner_password' else 'reset_owner_password' end);
 return account.auth_version+1;
end $$;
revoke execute on function public.replace_store_owner_password(integer,text,text,text) from public,anon,authenticated;
grant execute on function public.replace_store_owner_password(integer,text,text,text) to service_role;
