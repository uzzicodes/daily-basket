-- Active orders are paged separately so older unfinished orders remain visible.
create index orders_active_created_id_idx on public.orders(created_at desc,id desc) where status<>'Delivered';
create function public.list_desk_orders(p_view text default 'active',p_before timestamptz default null,p_before_id text default null,p_limit integer default 201)
returns setof public.orders language sql stable security invoker set search_path=public as $$
 select * from orders
 where ((p_view='active' and status<>'Delivered') or (p_view='delivered' and status='Delivered'))
 and (p_before is null or (created_at,id)<(p_before,p_before_id))
 order by created_at desc,id desc
 limit greatest(1,least(coalesce(p_limit,201),201));
$$;
revoke execute on function public.list_desk_orders(text,timestamptz,text,integer) from public,anon,authenticated;
grant execute on function public.list_desk_orders(text,timestamptz,text,integer) to service_role;
