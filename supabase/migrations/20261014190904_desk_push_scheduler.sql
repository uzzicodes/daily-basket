-- Supabase-only scheduler. No network request is made when the alert queue is empty.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
revoke all on schema net,cron from public,anon,authenticated;
create schema if not exists askari_private;
revoke all on schema askari_private from public,anon,authenticated;
create function askari_private.wake_desk_alerts() returns void language plpgsql security invoker set search_path='' as $$
declare target text; token text;
begin
 delete from public.desk_push_devices where last_seen_at<now()-interval '30 days';
 delete from public.desk_push_deliveries where status in ('sent','failed') and created_at<now()-interval '7 days';
 if not exists(select 1 from public.desk_push_deliveries where (status='queued' and next_attempt_at<=now()) or (status='sending' and lease_until<now())) then return;end if;
 select decrypted_secret into target from vault.decrypted_secrets where name='askari_desk_alert_url';
 select decrypted_secret into token from vault.decrypted_secrets where name='askari_desk_alert_secret';
 if target is null or token is null then return;end if;
 perform net.http_post(url:=target,headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||token),body:='{}'::jsonb,timeout_milliseconds:=30000);
end $$;
revoke all on function askari_private.wake_desk_alerts() from public,anon,authenticated,service_role;
select cron.schedule('askari-desk-phone-alerts','* * * * *','select askari_private.wake_desk_alerts()');
