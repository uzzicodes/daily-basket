alter table public.products add column source_sku_aliases text[] not null default '{}';
alter table public.products add column source_aliases jsonb not null default '[]' check(jsonb_typeof(source_aliases)='array');
create or replace function public.inventory_snapshot() returns jsonb language sql stable security invoker set search_path=public as $$
 select jsonb_build_object('revision',(select revision from inventory_state where singleton),'products',coalesce((select jsonb_agg(x) from (select id,catalog_code,name,brand,unit,barcode,sku,source_name,source_aliases,source_sku_aliases,price,in_stock from products where not is_archived order by lower(name),id) x),'[]'::jsonb),
 'last_import',(select to_jsonb(i) from inventory_imports i order by created_at desc limit 1));
$$;
revoke execute on function public.inventory_snapshot() from public,anon,authenticated;
grant execute on function public.inventory_snapshot() to service_role;
