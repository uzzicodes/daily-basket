alter table public.products alter column price drop not null;
alter table public.products alter column original_price drop not null;
alter table public.products alter column rating drop not null;
alter table public.products alter column in_stock set default false;
alter table public.products add constraint priced_stock check(not in_stock or price is not null);
alter table public.products add column is_archived boolean not null default false;
alter table public.products add column source_site text;
alter table public.products add column source_url text;
alter table public.products add column source_id text;
alter table public.products add column source_variant_id text;
alter table public.products add column source_name text;
alter table public.products add column sku text;
alter table public.products add column barcode text;
alter table public.products add column catalog_code text generated always as ('ASK-'||upper(substring(md5(id::text),1,16))) stored;
create unique index products_code_idx on public.products(catalog_code);
create index products_catalog_idx on public.products(is_archived,lower(name),id);
create table public.inventory_state(singleton boolean primary key default true check(singleton),revision bigint not null default 1,updated_at timestamptz not null default now());
insert into public.inventory_state(singleton) values(true);
create table public.inventory_imports(id uuid primary key,file_name text not null,request_hash text not null,rows_count integer not null,stock_count integer not null,revision bigint not null,created_at timestamptz not null default now());
alter table public.inventory_state enable row level security;
alter table public.inventory_imports enable row level security;
revoke all on public.inventory_state,public.inventory_imports from public,anon,authenticated;
grant select,insert,update on public.inventory_state,public.inventory_imports to service_role;

create function public.browse_catalog(p_search text default '',p_category text default 'All',p_brands text[] default '{}',p_available boolean default false,p_sort text default 'az',p_offset integer default 0,p_limit integer default 48,p_ids uuid[] default null)
returns jsonb language sql stable security invoker set search_path=public as $$
 with matched as (
  select * from products where not is_archived
   and (p_ids is null or id=any(p_ids))
   and (p_category='All' or category=p_category)
   and (coalesce(cardinality(p_brands),0)=0 or brand=any(p_brands))
   and (not p_available or in_stock)
   and (coalesce(p_search,'')='' or (name||' '||brand||' '||unit) ilike '%'||p_search||'%')
 ), page as (
  select id,name,brand,category,price,original_price,unit,image_url,rating,in_stock,catalog_code,0 as popularity from matched
  order by case when p_sort='az' then lower(name) end asc,case when p_sort='za' then lower(name) end desc,
   case when p_sort='low' then price end asc nulls last,case when p_sort='high' then price end desc nulls last,id
  limit greatest(1,least(p_limit,60)) offset greatest(0,p_offset)
 )
 select jsonb_build_object('products',coalesce((select jsonb_agg(to_jsonb(page)) from page),'[]'::jsonb),'total',(select count(*) from matched),
  'catalog_total',(select count(*) from products where not is_archived),'available_total',(select count(*) from products where not is_archived and in_stock),
  'categories',coalesce((select jsonb_agg(x) from (select category as name,count(*) as count from products where not is_archived group by category order by category) x),'[]'::jsonb),
  'brands',coalesce((select jsonb_agg(x) from (select brand as name,count(*) as count from products where not is_archived group by brand order by brand) x),'[]'::jsonb),
  'next_offset',case when greatest(0,p_offset)+greatest(1,least(p_limit,60))<(select count(*) from matched) then greatest(0,p_offset)+greatest(1,least(p_limit,60)) else null end,
  'revision',(select revision from inventory_state where singleton));
$$;
create function public.inventory_snapshot() returns jsonb language sql stable security invoker set search_path=public as $$
 select jsonb_build_object('revision',(select revision from inventory_state where singleton),'products',coalesce((select jsonb_agg(x) from (select id,catalog_code,name,brand,unit,barcode,sku,source_name,price,in_stock from products where not is_archived order by lower(name),id) x),'[]'::jsonb),
 'last_import',(select to_jsonb(i) from inventory_imports i order by created_at desc limit 1));
$$;
create function public.apply_inventory_prices(p_rows jsonb,p_key uuid,p_file_name text,p_hash text,p_revision bigint)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare old inventory_imports%rowtype;current_revision bigint;active_count integer;row_count integer;
begin
 -- Exclude concurrent imports and checkout FOR SHARE readers while replacing stock.
 if p_key is null or p_hash is null or p_hash='' or p_file_name is null or p_file_name='' then raise exception 'Invalid import identity.';end if;
 lock table products in exclusive mode;
 select * into old from inventory_imports where id=p_key;
 if found then
  if old.request_hash<>p_hash then raise exception 'The file changed. Review the import again.';end if;
  return jsonb_build_object('revision',old.revision,'rows_count',old.rows_count,'stock_count',old.stock_count,'id',old.id);
 end if;
 select revision into current_revision from inventory_state where singleton for update;
 if p_revision is distinct from current_revision then raise exception 'Inventory changed since your preview. Reload and review the file again.';end if;
 if jsonb_typeof(p_rows) is distinct from 'array' then raise exception 'Invalid inventory rows.';end if;
 if jsonb_array_length(p_rows) not between 1 and 25000 then raise exception 'Choose a complete non-empty price list.';end if;
 row_count:=jsonb_array_length(p_rows);
 if (select count(distinct product_id) from jsonb_to_recordset(p_rows) as r(product_id uuid,price numeric))<>row_count then raise exception 'Duplicate or missing product in price list.';end if;
 if exists(select 1 from jsonb_to_recordset(p_rows) as r(product_id uuid,price numeric) left join products p on p.id=r.product_id and not p.is_archived where p.id is null) then raise exception 'A product no longer exists in the catalog.';end if;
 if exists(select 1 from jsonb_to_recordset(p_rows) as r(product_id uuid,price numeric) where price is not null and (price<=0 or price>9999999999.99 or price<>round(price,2))) then raise exception 'Prices must be positive PKR amounts with at most two decimals.';end if;
 select count(*) into active_count from jsonb_to_recordset(p_rows) as r(product_id uuid,price numeric) where price is not null;
 update products set in_stock=false where not is_archived;
 update products p set price=r.price,original_price=r.price,rating=null,in_stock=(r.price is not null) from jsonb_to_recordset(p_rows) as r(product_id uuid,price numeric) where p.id=r.product_id;
 update inventory_state set revision=revision+1,updated_at=now() where singleton returning revision into current_revision;
 insert into inventory_imports(id,file_name,request_hash,rows_count,stock_count,revision) values(p_key,left(p_file_name,150),p_hash,row_count,active_count,current_revision);
 return jsonb_build_object('id',p_key,'revision',current_revision,'rows_count',row_count,'stock_count',active_count);
end $$;
revoke execute on function public.browse_catalog(text,text,text[],boolean,text,integer,integer,uuid[]),public.inventory_snapshot(),public.apply_inventory_prices(jsonb,uuid,text,text,bigint) from public,anon,authenticated;
grant execute on function public.browse_catalog(text,text,text[],boolean,text,integer,integer,uuid[]),public.inventory_snapshot(),public.apply_inventory_prices(jsonb,uuid,text,text,bigint) to service_role;
