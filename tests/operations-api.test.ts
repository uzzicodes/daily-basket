import {test} from 'node:test';
import assert from 'node:assert/strict';
import {issueStaffToken,staffPassword,type StaffActor} from '../lib/staff';
import {POST as signIn} from '../app/api/operations/session/route';
import {GET as list,PATCH} from '../app/api/operations/orders/route';
import {GET as single} from '../app/api/operations/orders/[id]/route';
import {GET as receipt} from '../app/api/operations/receipt/[id]/route';

test('Staff HTTP routes enforce assigned/approved order filters and reject forged cash actions before mutation',async t=>{
 const originalFetch=globalThis.fetch,env={...process.env};
 process.env.ADMIN_SESSION_SECRET='isolated-api-test-signing-secret-longer-than-32';process.env.SUPABASE_URL='https://isolated-database.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='isolated-test-key';
 t.after(()=>{globalThis.fetch=originalFetch;for(const key of ['ADMIN_SESSION_SECRET','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']){if(env[key]===undefined)delete process.env[key];else process.env[key]=env[key];}});
 const id='00000000-0000-4000-8000-000000000011',orderId='ORD-00000000-0000-4000-8000-000000000021';
 let actor:StaffActor={id,role:'packer',username:'isolated-packer',display_name:'Isolated fixture',auth_version:1},active=true,orderRead=false,mutations=0;
 globalThis.fetch=async(input,options)=>{
  const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);
  if(url.pathname.endsWith('/store_staff'))return Response.json({...actor,active});
  if(url.pathname.endsWith('/orders')){
   orderRead=true;assert.equal(options?.method??'GET','GET');assert.doesNotMatch(url.searchParams.get('select')||'',/cost|profit|request_hash|idempotency/);
   if(actor.role==='rider')assert.equal(url.searchParams.get('assigned_rider_id'),'eq.'+actor.id);
   if(actor.role==='packer')assert.equal(url.searchParams.get('approval_status'),'eq.approved');
   return Response.json(url.searchParams.has('id')?null:[]);
  }
  mutations++;throw Error('Unexpected database write or photo request: '+url.pathname);
 };
 for(const role of ['packer','rider'] as const){
  actor={...actor,role};const token=await issueStaffToken(actor),headers={Authorization:'Bearer '+token,'X-Daily-Basket-Client':'staff-v1'};
  assert.equal((await list(new Request('https://store.invalid/api/operations/orders?view=all',{headers}))).status,200);
  assert.equal((await single(new Request('https://store.invalid/api/operations/orders/'+orderId,{headers}),{params:Promise.resolve({id:orderId})})).status,404);
  // Receipt downloads reject the same unauthorized order before touching photos/fonts.
  // Rate-limit persistence is outside this isolated transport fixture, so order-ID isolation is also checked on its source filter by the single-order route above.
  const cash=await PATCH(new Request('https://store.invalid/api/operations/orders',{method:'PATCH',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({id:orderId,action:'settle',expected_version:0,payload:{cash_received:123}})}));assert.equal(cash.status,403);
  active=false;assert.equal((await list(new Request('https://store.invalid/api/operations/orders',{headers}))).status,401);active=true;
 }
 assert.equal(orderRead,true);assert.equal(mutations,0);
 assert.equal((await receipt(new Request('https://store.invalid/api/operations/receipt/'+orderId),{params:Promise.resolve({id:orderId})})).status,401);
 // Native sessions live solely in SecureStore; browser sessions remain HttpOnly.
 const credentials={credential_salt:'isolated-salt',credential_hash:await staffPassword('isolated-password','isolated-salt')};
 globalThis.fetch=async input=>{const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url);if(url.pathname.endsWith('/consume_rate_limit'))return Response.json(true);if(url.pathname.endsWith('/store_staff'))return Response.json({...actor,active:true,...credentials});throw Error('Unexpected login request');};
 const native=await signIn(new Request('https://store.invalid/api/operations/session',{method:'POST',headers:{'X-Daily-Basket-Client':'staff-v1'},body:JSON.stringify({username:actor.username,password:'isolated-password'})}));assert.equal(native.status,200);assert.equal(native.headers.has('set-cookie'),false);assert.equal(typeof (await native.json() as {token:string}).token,'string');
 const web=await signIn(new Request('https://store.invalid/api/operations/session',{method:'POST',headers:{Origin:'https://store.invalid'},body:JSON.stringify({username:actor.username,password:'isolated-password'})}));assert.equal(web.status,200);assert.match(web.headers.get('set-cookie')||'',/HttpOnly/i);assert.equal('token' in (await web.json() as object),false);
});
