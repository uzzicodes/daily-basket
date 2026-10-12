-- The dashboard's automatic-RLS event trigger is internal, not a customer RPC.
-- Some projects do not enable this helper, so keep the migration portable.
do $$
begin
 if to_regprocedure('public.rls_auto_enable()') is not null then
  revoke execute on function public.rls_auto_enable() from public,anon,authenticated,service_role;
 end if;
end $$;
