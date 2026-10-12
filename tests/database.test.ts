import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { orderPage, decodeOrderCursor } from '../lib/order-pagination';
import type { Order } from '../lib/types';

// An isolated PostgreSQL engine: no Supabase account, customer records or network writes.
const db=new PGlite();
const customer={customer_name:'Database Test',customer_phone:'03001234567',delivery_area:'DHA Phase 5',delivery_address:'House 12 Street 4 Block A'};
const productId='00000000-0000-4000-8000-000000000001';
const items=[{product_id:productId,quantity:1}];
async function checkout(entries:unknown=items,total=1150,key=crypto.randomUUID(),hash='test-request'){
  const r=await db.query<{order:{id:string;subtotal:number;delivery_fee:number;total_amount:number}}>(
    'select public.create_checkout_order($1::jsonb,$2::jsonb,$3::uuid,$4::text,$5::numeric) as "order"',
    [JSON.stringify(customer),JSON.stringify(entries),key,hash,total]);
  return r.rows[0].order;
}
before(async()=>{
  // Match Supabase's API roles and default object grants, including its anon defaults.
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
    grant usage on schema public to anon,authenticated,service_role;
    alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
    alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;`);
  // Simulate the dashboard helper so its internal-only ACL is tested as well.
  await db.exec(`create function public.rls_auto_enable() returns event_trigger language plpgsql security definer as $$begin end$$;`);
  const files=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
  for(const file of files)await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
});
beforeEach(async()=>{await db.exec(`reset role;delete from orders;delete from api_limits;delete from inventory_imports;update inventory_state set revision=1;update products set is_archived=false;
  update products set price=1000,original_price=1000,in_stock=true where id='${productId}';`);});
after(async()=>{await db.close();});

test('All migrations load and the seed catalog has all 18 grocery products',async()=>{
  const r=await db.query<{count:number}>('select count(*)::int as count from products');assert.equal(r.rows[0].count,18);
});
test('Checkout snapshots authoritative prices and freezes the complete response across retries',async()=>{
  const key=crypto.randomUUID();const first=await checkout(items,1150,key);
  assert.equal(first.subtotal,1000);assert.equal(first.delivery_fee,150);assert.equal(first.total_amount,1150);
  await db.exec(`update products set price=900,in_stock=false where id='${productId}'`);
  assert.deepEqual(await checkout(items,1150,key),first);
  await assert.rejects(()=>checkout(items,1150,key,'different-request'),/basket changed/);
  const r=await db.query<{count:number;price:number}>('select count(*)::int as count,min((items->0->>\'price\')::numeric) as price from orders');
  assert.equal(r.rows[0].count,1);assert.equal(Number(r.rows[0].price),1000);
});
test('A changed catalog price rejects the order without saving anything; review can retry',async()=>{
  const key=crypto.randomUUID();await assert.rejects(()=>checkout(items,1149,key),/Prices have changed/);
  const r=await db.query<{count:number}>('select count(*)::int as count from orders');assert.equal(r.rows[0].count,0);
  assert.equal((await checkout(items,1150,key)).total_amount,1150);
});
test('SQL validates stock, duplicate products, null baskets and missing quantities atomically',async()=>{
  for(const invalid of [null,[],[...items,...items],[{product_id:productId}],[{product_id:productId,quantity:0}],[{product_id:productId,quantity:1.5}],[{product_id:crypto.randomUUID(),quantity:1}]]){
    await assert.rejects(()=>checkout(invalid));
  }
  await db.exec(`update products set in_stock=false where id='${productId}'`);await assert.rejects(()=>checkout(),/unavailable/);
  const r=await db.query<{count:number}>('select count(*)::int as count from orders');assert.equal(r.rows[0].count,0);
});
test('SQL free delivery boundary is inclusive at Rs. 2,999',async()=>{
  await db.exec(`update products set price=2998,original_price=2999 where id='${productId}'`);
  assert.equal((await checkout(items,3148)).delivery_fee,150);
  await db.exec(`update products set price=2999 where id='${productId}'`);
  assert.equal((await checkout(items,2999)).delivery_fee,0);
});
test('Anonymous and authenticated roles cannot read orders or invoke private RPCs',async()=>{
  for(const role of ['anon','authenticated']){
    await db.exec(`set role ${role}`);
    await assert.rejects(()=>db.query('select * from orders'),/permission denied/);
    await assert.rejects(()=>checkout(),/permission denied/);
    await assert.rejects(()=>db.query('select * from list_store_orders()'),/permission denied/);
    await assert.rejects(()=>db.query('select today_metrics()'),/permission denied/);
    await db.exec('reset role');
  }
  await db.exec('set role service_role');assert.equal((await checkout()).total_amount,1150);await db.exec('reset role');
});
test('The automatic-RLS event trigger is not a publicly executable API function',async()=>{
  for(const role of ['anon','authenticated','service_role']){
    const r=await db.query<{allowed:boolean}>("select has_function_privilege($1,'public.rls_auto_enable()','execute') as allowed",[role]);
    assert.equal(r.rows[0].allowed,false);
  }
});
test('450 orders with identical timestamps paginate without skipping or duplicating an order',async()=>{
  await db.exec(`insert into orders(customer_name,customer_phone,delivery_area,delivery_address,items,subtotal,delivery_fee,total_amount,idempotency_key,request_hash,created_at)
    select 'Test '||n,'03001234567','DHA Phase 5','House 12 Street 4','[]'::jsonb,1000,150,1150,gen_random_uuid(),'page-test','2026-10-12T01:02:03.123456Z'::timestamptz from generate_series(1,450) n;`);
  const seen=new Set<string>();let cursor:ReturnType<typeof decodeOrderCursor>|undefined;let pages=0;
  do{
    // Cast to text to preserve PostgreSQL microseconds (JS Date would truncate these).
    const r=await db.query<Order>(`select *,to_char(created_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') as created_at from list_store_orders($1::timestamptz,$2::text,201)`,[cursor?.created_at??null,cursor?.id??null]);
    const page=orderPage(r.rows);for(const order of page.orders){assert.equal(seen.has(order.id),false);seen.add(order.id);}
    cursor=page.nextCursor?decodeOrderCursor(page.nextCursor):undefined;pages++;
  }while(cursor);
  assert.equal(pages,3);assert.equal(seen.size,450);
});
test('Daily metrics use Karachi midnight boundaries and exclude future-day orders',async()=>{
  const a=await checkout();const b=await checkout();const old=await checkout();const future=await checkout();
  await db.query('update orders set status=\'Delivered\' where id=$1',[a.id]);
  await db.query(`update orders set created_at=((date_trunc('day',now() at time zone 'Asia/Karachi')) at time zone 'Asia/Karachi')-interval '1 microsecond' where id=$1`,[old.id]);
  await db.query(`update orders set created_at=((date_trunc('day',now() at time zone 'Asia/Karachi')+interval '1 day') at time zone 'Asia/Karachi') where id=$1`,[future.id]);
  await db.query(`update orders set created_at=((date_trunc('day',now() at time zone 'Asia/Karachi')) at time zone 'Asia/Karachi') where id=$1`,[b.id]);
  const r=await db.query<{metrics:{order_count:number;gross_revenue:number;collected_cod:number;estimated_profit_share:number}}>('select today_metrics() as metrics');
  assert.deepEqual(r.rows[0].metrics,{order_count:2,gross_revenue:2300,collected_cod:1150,estimated_profit_share:100});
});
test('Durable rate limits reset only after the window ends',async()=>{
  const allow=async()=>(await db.query<{allowed:boolean}>("select consume_rate_limit('test-client',2,900) as allowed")).rows[0].allowed;
  assert.equal(await allow(),true);assert.equal(await allow(),true);assert.equal(await allow(),false);
  await db.exec("update api_limits set window_started=now()-interval '901 seconds'");assert.equal(await allow(),true);
});
test('Pagination rejects malformed cursors and preserves sub-millisecond timestamps',()=>{
  for(const invalid of ['2026-10-12','!!!!','a'.repeat(401),Buffer.from(JSON.stringify({created_at:'2026-10-12T00:00:00Z',id:'not-an-order'})).toString('base64url')])assert.throws(()=>decodeOrderCursor(invalid));
});

async function inventory(rows:unknown,key=crypto.randomUUID(),revision=1,hash='inventory-test'){
 return (await db.query<{result:{revision:number;stock_count:number;rows_count:number}}>('select apply_inventory_prices($1::jsonb,$2::uuid,$3,$4,$5::bigint) as result',[JSON.stringify(rows),key,'test.xlsx',hash,revision])).rows[0].result;
}
test('Price imports replace stock, preserve order snapshots and retry exactly once',async()=>{
 const order=await checkout();const key=crypto.randomUUID();const rows=[{product_id:productId,price:1234.50}];
 const first=await inventory(rows,key);assert.equal(first.stock_count,1);assert.equal(first.revision,2);
 assert.deepEqual(await inventory(rows,key),first);await assert.rejects(()=>inventory(rows,key,1,'changed'),/file changed/);
 const state=await db.query<{stock:number;price:number}>('select count(*) filter(where in_stock)::int as stock,max(price) filter(where id=$1) as price from products',[productId]);assert.equal(state.rows[0].stock,1);assert.equal(Number(state.rows[0].price),1234.5);
 const saved=await db.query<{price:number}>('select (items->0->>\'price\')::numeric as price from orders where id=$1',[order.id]);assert.equal(Number(saved.rows[0].price),1000);
 await inventory([{product_id:productId,price:null}],crypto.randomUUID(),2);assert.equal((await db.query<{stock:number}>('select count(*) filter(where in_stock)::int as stock from products')).rows[0].stock,0);
});
test('Invalid or stale inventory imports leave the entire catalog unchanged',async()=>{
 for(const rows of [[],null,[{product_id:productId,price:0}],[{product_id:productId,price:1.001}],[{product_id:productId,price:100},{product_id:crypto.randomUUID(),price:1}],[{product_id:productId,price:100},{product_id:productId,price:200}]])await assert.rejects(()=>inventory(rows));
 await assert.rejects(()=>inventory([{product_id:productId,price:1}],crypto.randomUUID(),999),/Inventory changed/);
 assert.equal(Number((await db.query<{price:number}>('select price from products where id=$1',[productId])).rows[0].price),1000);
 assert.equal((await db.query<{count:number}>('select count(*)::int as count from inventory_imports')).rows[0].count,0);
});
test('Catalog filters, private inventory and paged null prices work through API roles',async()=>{
 await db.exec(`update products set in_stock=false;update products set price=null,original_price=null,rating=null where id='${productId}';`);
 const page=(await db.query<{catalog:{products:{id:string;price:number|null}[];total:number;next_offset:number}}>("select browse_catalog(p_limit=>5) as catalog")).rows[0].catalog;
 assert.equal(page.products.length,5);assert.equal(page.total,18);assert.equal(page.next_offset,5);
 const selected=(await db.query<{catalog:{products:{price:number|null}[]}}>('select browse_catalog(p_ids=>$1::uuid[]) as catalog',[[productId]])).rows[0].catalog;assert.equal(selected.products[0].price,null);
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(()=>db.query('select inventory_snapshot()'),/permission denied/);await assert.rejects(()=>db.query('select browse_catalog()'),/permission denied/);await assert.rejects(()=>inventory([{product_id:productId,price:1}]),/permission denied/);await db.exec('reset role');}
 await db.exec('set role service_role');assert.equal((await inventory([{product_id:productId,price:100}])).stock_count,1);await db.exec('reset role');
});
