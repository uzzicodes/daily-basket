import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {staffPassword,issueStaffToken,verifyStaffSignature} from '../lib/staff';
import {sessionToken,verifyToken} from '../lib/security';
import {canPerform,actionSchema,operationalView,type OperationalOrder} from '../lib/operations';
const db=new PGlite();
const manager='00000000-0000-4000-8000-000000000011',packer='00000000-0000-4000-8000-000000000012',rider='00000000-0000-4000-8000-000000000013',other='00000000-0000-4000-8000-000000000014';
const product='00000000-0000-4000-8000-000000000001';let order:string;
before(async()=>{
 await db.exec('create role anon;create role authenticated;create role service_role bypassrls;grant usage on schema public to anon,authenticated,service_role;alter default privileges in schema public grant all on tables to anon,authenticated,service_role;alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;create function public.rls_auto_enable() returns event_trigger language plpgsql security definer as $$begin end$$;');
 for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')&&!f.endsWith('_scheduler.sql')).sort())await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
 await db.exec(`update products set price=1000,original_price=1000,in_stock=true where id='${product}';`);
 for(const [id,name,role] of [[manager,'manager','manager'],[packer,'packer','packer'],[rider,'rider','rider'],[other,'other-rider','rider']])await db.query('insert into store_staff(id,username,display_name,role,credential_salt,credential_hash) values($1,$2,$2,$3,$2,$2)',[id,name,role]);
 const customer={customer_name:'Isolated role test',customer_phone:'03001234567',delivery_area:'PGECHS',delivery_address:'Isolated fixture',delivery_latitude:31.41216075,delivery_longitude:74.27587375};
 const saved=await db.query<{order:{id:string}}>('select create_checkout_order($1::jsonb,$2::jsonb,$3::uuid,$4::text,$5::numeric) as "order"',[JSON.stringify(customer),JSON.stringify([{product_id:product,quantity:2}]),crypto.randomUUID(),'roles-test',2150]);order=saved.rows[0].order.id;
});
after(async()=>db.close());
async function act(action:string,role:string,id:string|null,payload:unknown={},version?:number){const current=await db.query<{operation_version:number}>('select operation_version from orders where id=$1',[order]);return db.query('select perform_store_order_action($1,$2,$3,$4,$5::uuid,$6::jsonb)',[order,action,version??current.rows[0].operation_version,role,id,JSON.stringify(payload)]);}
test('Staff credentials are salted and staff tokens cannot become owner or desk sessions',async()=>{
 process.env.ADMIN_SESSION_SECRET='isolated-staff-test-signing-secret-at-least-32';
 const a=await staffPassword('a-safe-test-password','salt-a'),b=await staffPassword('a-safe-test-password','salt-b');assert.equal(a.length,64);assert.notEqual(a,b);
 const token=await issueStaffToken({id:manager,username:'manager',display_name:'Manager',role:'manager',auth_version:2});assert.deepEqual(await verifyStaffSignature(token),{id:manager,auth_version:2});assert.equal(await verifyToken(token),false);assert.equal(await verifyStaffSignature(token+'tampered'),null);assert.equal(await verifyStaffSignature(await sessionToken()),null);assert.equal(await verifyStaffSignature(token,Date.now()+9*60*60*1000),null);
 assert.equal(canPerform('packer','settle'),false);assert.equal(canPerform('rider','approve'),false);assert.equal(canPerform('manager','settle'),true);
 assert.equal(actionSchema.safeParse({id:order,action:'settle',expected_version:0,payload:{cash_received:2150,delivery_verified:true},role:'owner'}).success,false);
 delete process.env.ADMIN_SESSION_SECRET;
});
test('Packed publishes a ready order; only a rider can claim pickup, then report delivery before manager payment',async()=>{
 await assert.rejects(()=>act('depart','packer',packer),/Only a rider/);
 await assert.rejects(()=>act('depart','manager',manager),/Only a rider/);
 await assert.rejects(()=>act('depart','rider',rider),/not assigned/);
 await assert.rejects(()=>act('approve','manager',manager),/do not require approval/);
 await assert.rejects(()=>act('finish_pack','packer',packer,{checked_items:[{product_id:product,quantity:1}]}),/exact product and quantity/);
 await act('finish_pack','packer',packer,{checked_items:[{product_id:product,quantity:2}]});
 const ready=(await db.query<{status:string;packed_at:string;assigned_rider_id:string|null}>('select status,packed_at,assigned_rider_id from orders where id=$1',[order])).rows[0];assert.equal(ready.status,'Packing');assert.ok(ready.packed_at);assert.equal(ready.assigned_rider_id,null);
 await assert.rejects(()=>act('finish_pack','packer',packer,{},0),/Order changed/);
 await assert.rejects(()=>act('assign_rider','packer',packer,{rider_id:rider}),/Only the owner/);
 await assert.rejects(()=>act('depart','packer',packer),/Only a rider/);
 await act('depart','rider',rider);
 assert.equal((await db.query<{assigned_rider_id:string}>('select assigned_rider_id from orders where id=$1',[order])).rows[0].assigned_rider_id,rider);
 await assert.rejects(()=>act('depart','rider',other),/not assigned/);
 await assert.rejects(()=>act('settle','manager',manager,{cash_received:2150,delivery_verified:true}),/Delivery must be reported/);
 await act('deliver','rider',rider);
 const row=(await db.query<{status:string;cash_confirmed:boolean;cash_received:number}>('select status,cash_confirmed,cash_received from orders where id=$1',[order])).rows[0];assert.equal(row.status,'Delivered');assert.equal(row.cash_confirmed,false);assert.equal(row.cash_received,null);
});
test('Only manager/owner can close exact cash once; inactive staff lose authority immediately',async()=>{
 await assert.rejects(()=>act('settle','rider',rider,{cash_received:2150,delivery_verified:true}),/manager or owner/);
 await assert.rejects(()=>act('settle','packer',packer,{cash_received:2150,delivery_verified:true}),/manager or owner/);
 await assert.rejects(()=>act('settle','manager',manager,{cash_received:2150}),/Verify delivery/);
 await assert.rejects(()=>act('settle','manager',manager,{cash_received:2000,delivery_verified:true}),/match the bill exactly/);
 await db.query('update store_staff set active=false where id=$1',[manager]);await assert.rejects(()=>act('settle','manager',manager,{cash_received:2150,delivery_verified:true}),/revoked/);await db.query('update store_staff set active=true where id=$1',[manager]);
 await act('settle','manager',manager,{cash_received:2150,delivery_verified:true});await assert.rejects(()=>act('settle','manager',manager,{cash_received:2150,delivery_verified:true}),/not awaiting cash/);
 const events=await db.query<{actor_role:string;action:string}>('select actor_role,action from store_audit_events where order_id=$1 and action=$2',[order,'settle']);assert.equal(events.rows.length,1);assert.equal(events.rows[0].actor_role,'manager');
});

test('Unavailable-item cancellation is manager-only and a cancelled order cannot be dispatched or paid',async()=>{
 const saved=(await db.query<{o:{id:string}}>('select create_checkout_order($1::jsonb,$2::jsonb,$3::uuid,$4::text,1150) o',[JSON.stringify({customer_name:'Cancellation fixture',customer_phone:'03001234567',delivery_area:'PGECHS',delivery_address:'Isolated fixture',delivery_latitude:31.41216075,delivery_longitude:74.27587375}),JSON.stringify([{product_id:product,quantity:1}]),crypto.randomUUID(),'cancellation-fixture'])).rows[0].o.id;
 const call=(action:string,role:string,staff:string,version=0,payload:unknown={})=>db.query('select perform_store_order_action($1,$2,$3,$4,$5::uuid,$6::jsonb)',[saved,action,version,role,staff,JSON.stringify(payload)]);
 await assert.rejects(()=>call('reject','packer',packer,0,{reason:'Item unavailable'}),/manager or owner/);
 await call('reject','manager',manager,0,{reason:'Item unavailable: exact fixture pack'});
 await assert.rejects(()=>call('start_pack','packer',packer,1),/not awaiting packing/);
 await assert.rejects(()=>call('depart','packer',packer,1),/Only a rider/);
 await assert.rejects(()=>call('settle','manager',manager,1,{cash_received:1150,delivery_verified:true}),/Delivery must be reported/);
 const row=(await db.query<{status:string;rejection_reason:string;cash_confirmed:boolean}>('select status,rejection_reason,cash_confirmed from orders where id=$1',[saved])).rows[0];assert.equal(row.status,'Cancelled');assert.match(row.rejection_reason,/Item unavailable/);assert.equal(row.cash_confirmed,false);
 assert.equal(canPerform('packer','deliver'),false);assert.equal(canPerform('packer','reject'),false);assert.equal(canPerform('packer','depart'),false);
});
test('Actual profit stays unknown without costs and becomes recorded revenue minus costs and expenses',async()=>{
 let summary=(await db.query<{s:{recorded_profit:number|null;missing_cost_orders:number;cash_received:number}}>('select store_business_summary(0) s')).rows[0].s;assert.equal(summary.recorded_profit,null);assert.equal(summary.missing_cost_orders,1);assert.equal(Number(summary.cash_received),2150);
 await db.query('select save_store_order_costs($1,$2::jsonb,$3,true)',[order,JSON.stringify([{product_id:product,unit_cost:700}]),80]);
 await db.query('insert into store_expenses(request_key,expense_date,amount,category,note) values($1,current_date,50,$2,$3)',[crypto.randomUUID(),'Packing','Actual recorded packaging cost']);
 summary=(await db.query<{s:{recorded_profit:number;missing_cost_orders:number;cash_received:number}}>('select store_business_summary(0) s')).rows[0].s;assert.equal(Number(summary.recorded_profit),620);assert.equal(summary.missing_cost_orders,0);
 await db.query('update store_product_costs set unit_cost=900 where product_id=$1',[product]);const cost=(await db.query<{unit_cost:number}>('select unit_cost from store_order_costs where order_id=$1',[order])).rows[0];assert.equal(Number(cost.unit_cost),700);
});
test('Staff views omit financial secrets and public roles cannot reach staff, audit or owner cost data',async()=>{
 const row=(await db.query('select * from orders where id=$1',[order])).rows[0] as OperationalOrder;const visible=operationalView({...row,profit:100,credential_hash:'secret'} as OperationalOrder);assert.equal('profit' in visible,false);assert.equal('credential_hash' in visible,false);assert.equal('request_hash' in visible,false);
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);for(const table of ['store_staff','store_order_costs','store_product_costs','store_order_finance','store_expenses','store_audit_events'])await assert.rejects(()=>db.query('select * from '+table),/permission denied/);await assert.rejects(()=>db.query('select store_business_summary(0)'),/permission denied/);await assert.rejects(()=>db.query('select perform_store_order_action($1,$2,0,$3,null,$4::jsonb)',[order,'settle','owner','{}']),/permission denied/);await db.exec('reset role');}
});
test('Owner test resets are reversible, preserve receipts, reject stale snapshots and leave future sales included',async()=>{
 const original=(await db.query<{s:any}>('select store_business_summary(0) s')).rows[0].s;
 const state=(await db.query<{s:any}>('select preview_store_report_reset() s')).rows[0].s;
 const id=crypto.randomUUID();await assert.rejects(()=>db.query('select reset_store_test_reports($1,$2)',[id,'wrong-snapshot']),/Orders changed/);
 await db.query('select reset_store_test_reports($1,$2)',[id,state.snapshot]);
 await db.query('select reset_store_test_reports($1,$2)',[id,state.snapshot]);
 let summary=(await db.query<{s:any}>('select store_business_summary(0) s')).rows[0].s;
 assert.equal(Number(summary.sales),0);assert.equal(Number(summary.cash_received),0);assert.equal(Number(summary.order_count),0);assert.equal(Number(summary.excluded_test_orders),Number(state.order_count));assert.equal(Number(summary.expenses),Number(original.expenses));assert.ok(summary.daily_sales.every((d:any)=>Number(d.sales)===0&&Number(d.orders)===0));
 const receipt=(await db.query<{status:string;total_amount:number}>('select status,total_amount from orders where id=$1',[order])).rows[0];assert.equal(receipt.status,'Delivered');assert.equal(Number(receipt.total_amount),2150);
 const customer={customer_name:'Future isolated order',customer_phone:'03001234567',delivery_area:'PGECHS',delivery_address:'Future isolated fixture',delivery_latitude:31.41216075,delivery_longitude:74.27587375};
 const created=(await db.query<{o:{id:string}}>('select create_checkout_order($1::jsonb,$2::jsonb,$3,$4,1150) o',[JSON.stringify(customer),JSON.stringify([{product_id:product,quantity:1}]),crypto.randomUUID(),'future-reset-test'])).rows[0].o.id;
 summary=(await db.query<{s:any}>('select store_business_summary(0) s')).rows[0].s;assert.equal(Number(summary.order_count),1);assert.equal(Number(summary.placed_value),1150);
 await db.query('select restore_store_test_reports($1)',[id]);await db.query('select restore_store_test_reports($1)',[id]);
 summary=(await db.query<{s:any}>('select store_business_summary(0) s')).rows[0].s;assert.equal(Number(summary.sales),Number(original.sales));assert.equal(Number(summary.order_count),Number(original.order_count)+1);assert.equal(Number(summary.excluded_test_orders),0);
 assert.equal((await db.query('select * from orders where id=$1',[created])).rows.length,1);
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);for(const table of ['store_report_resets','store_report_exclusions'])await assert.rejects(()=>db.query('select * from '+table),/permission denied/);await assert.rejects(()=>db.query('select reset_store_test_reports($1,$2)',[crypto.randomUUID(),state.snapshot]),/permission denied/);await assert.rejects(()=>db.query('select restore_store_test_reports($1)',[id]),/permission denied/);await db.exec('reset role');}
});


test('Two riders cannot claim the same pickup or take another rider’s delivery',async()=>{
 const id=(await db.query<{o:{id:string}}>('select create_checkout_order($1::jsonb,$2::jsonb,$3::uuid,$4::text,1150) o',[JSON.stringify({customer_name:'Pickup race fixture',customer_phone:'03001234567',delivery_area:'PGECHS',delivery_address:'Isolated fixture',delivery_latitude:31.41216075,delivery_longitude:74.27587375}),JSON.stringify([{product_id:product,quantity:1}]),crypto.randomUUID(),'pickup-race'])).rows[0].o.id;
 await db.query('select perform_store_order_action($1,$2,0,$3,$4::uuid,$5::jsonb)',[id,'finish_pack','packer',packer,JSON.stringify({checked_items:[{product_id:product,quantity:1}]})]);
 const pickup=(who:string)=>db.query('select perform_store_order_action($1,$2,1,$3,$4::uuid,$5::jsonb)',[id,'depart','rider',who,'{}']);
 const results=await Promise.allSettled([pickup(rider),pickup(other)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected').length,1);
 const row=(await db.query<{assigned_rider_id:string;status:string;operation_version:number}>('select assigned_rider_id,status,operation_version from orders where id=$1',[id])).rows[0];assert.equal(row.status,'Out for Delivery');assert.equal(row.operation_version,2);assert.ok([rider,other].includes(row.assigned_rider_id));
 const loser=row.assigned_rider_id===rider?other:rider;await assert.rejects(()=>db.query('select perform_store_order_action($1,$2,2,$3,$4::uuid,$5::jsonb)',[id,'deliver','rider',loser,'{}']),/not assigned/);
});
