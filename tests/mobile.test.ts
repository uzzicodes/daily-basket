import {test} from 'node:test';
import assert from 'node:assert/strict';
import {customerReceiptView,mobileRequestAllowed,issueCustomerReceiptToken,verifyCustomerReceiptToken} from '../lib/customer-receipt';
import {verifyToken} from '../lib/security';
import {POST as checkout} from '../app/api/mobile/checkout/route';
import {POST as status} from '../app/api/mobile/order-status/route';
import {GET as config} from '../app/api/mobile/config/route';
import {available,covered,distanceKm,refreshedLines,totals,rejectedAttempt,receiptOrder} from '../mobile/src/domain';
import type {Product,StoreConfig} from '../mobile/src/types';
import {AppError,requestJSON} from '../mobile/src/transport';
const id='ORD-01234567-1234-4567-89ab-0123456789ab';
test('Native checkout permits identified native clients but keeps browser origin checks',()=>{
 const request=(headers:Record<string,string>)=>new Request('https://store.test/api/mobile/checkout',{headers});
 assert.equal(mobileRequestAllowed(request({})),false);
 assert.equal(mobileRequestAllowed(request({'x-askari-client':'mobile-v1'})),true);
 assert.equal(mobileRequestAllowed(request({'x-askari-client':'mobile-v1',origin:'https://evil.test'})),false);
 assert.equal(mobileRequestAllowed(request({'x-askari-client':'mobile-v1','sec-fetch-site':'cross-site'})),false);
 assert.equal(mobileRequestAllowed(request({'x-askari-client':'mobile-v1',origin:'https://store.test','sec-fetch-site':'same-origin'})),true);
});
test('Customer receipt tokens bind one order, expire, resist tampering and cannot authenticate staff',async()=>{
 process.env.ADMIN_SESSION_SECRET='test-only-mobile-receipt-secret-32characters';
 const now=Date.now(),token=await issueCustomerReceiptToken(id,now);
 assert.equal(await verifyCustomerReceiptToken(id,token,now),true);
 assert.equal(await verifyCustomerReceiptToken(id.replace('89ab','89ac'),token,now),false);
 assert.equal(await verifyCustomerReceiptToken(id,token.slice(0,-1)+(token.endsWith('a')?'b':'a'),now),false);
 assert.equal(await verifyCustomerReceiptToken(id,token,now+90*86400000),false);
 assert.equal(await verifyCustomerReceiptToken(id,token+'.extra',now),false);
 assert.equal(await verifyToken(token,'owner'),false);assert.equal(await verifyToken(token,'desk'),false);
 delete process.env.ADMIN_SESSION_SECRET;
});
test('Native endpoints fail closed before persistence; client headers cannot replace receipt authentication',async()=>{
 delete process.env.SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
 const request=(path:string,body:string,headers:Record<string,string>={'x-askari-client':'mobile-v1'})=>new Request('https://store.test/api/mobile/'+path,{method:'POST',headers,body});
 assert.equal((await checkout(request('checkout','{}',{}))).status,403);
 assert.equal((await checkout(request('checkout','{bad'))).status,400);
 assert.equal((await checkout(request('checkout',JSON.stringify({items:[],price:1})))).status,400);
 assert.equal((await status(request('order-status',JSON.stringify({id,token:'guessed'})))).status,401);
 assert.equal((await status(request('order-status','a'.repeat(501)))).status,400);
 const body=await config().json() as StoreConfig;assert.equal(body.radius_km,7);assert.equal(body.departments.length,9);assert.equal(Object.keys(body).some(k=>/secret|service|webhook|password/i.test(k)),false);
});
test('Reordering uses refreshed availability and prices; quantities and delivery thresholds stay valid',()=>{
 const p:Product={id:'123',name:'Milk',unit:'1 litre',brand:'Brand',category:'Dairy',image_url:'',price:450,in_stock:true};
 const refreshed=refreshedLines([{product:p,quantity:200}],[{...p,price:500}]);assert.equal(refreshed.changed,true);assert.equal(refreshed.lines[0].product.price,500);assert.equal(refreshed.lines[0].quantity,99);
 assert.deepEqual(refreshedLines([{product:p,quantity:1}],[{...p,in_stock:false}]).removed,['Milk']);
 assert.equal(available({...p,price:null}),false);assert.equal(available({...p,price:0}),false);
 const conf={free_delivery:2999,delivery_fee:150,location:{latitude:31.41216075,longitude:74.27587375},radius_km:7} as StoreConfig;
 assert.equal(totals([{product:{...p,price:2998},quantity:1}],conf).total_amount,3148);
 assert.equal(totals([{product:{...p,price:2999},quantity:1}],conf).delivery_fee,0);
 assert.equal(covered(conf.location,conf),true);assert.equal(distanceKm(conf.location,conf.location),0);assert.equal(covered({latitude:24.86,longitude:67.01},conf),false);assert.equal(covered({latitude:NaN,longitude:74},conf),false);
});
test('Customer receipts expose saved product photos and prices without cash controls, customer PII or costs',()=>{
 const item={product_id:'123',name:'Milk as ordered',unit:'1 litre',image_url:'https://example.test/saved.jpg',quantity:2,price:450,cost_price:200};
 const raw={id,status:'Pending',created_at:'2026-10-18T00:00:00Z',subtotal:900,delivery_fee:150,total_amount:1050,items:[item],customer_name:'Private',customer_phone:'Private',delivery_address:'Private',cash_received:true};
 const view=customerReceiptView(raw as unknown as import('../lib/types').Order);
 assert.equal(view.items[0].image_url,item.image_url);assert.equal(view.items[0].price,450);assert.equal('cost_price' in view.items[0],false);assert.equal('cash_received' in view,false);assert.equal('customer_name' in view,false);assert.equal('delivery_address' in view,false);
});
test('Stock changing during checkout unlocks a rejected attempt; uncertain responses retain it; retry receipts keep server history',async context=>{
 process.env.SUPABASE_URL='https://mobile-checkout.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='test-only-service-key';process.env.ADMIN_SESSION_SECRET='test-only-mobile-receipt-secret-32characters';
 context.after(()=>{delete process.env.SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;delete process.env.ADMIN_SESSION_SECRET;});
 let unavailable=true;
 const snapshot={id,status:'Packing',created_at:'2026-10-16T09:00:00.000Z',subtotal:450,delivery_fee:150,total_amount:600,items:[{product_id:'01234567-1234-4567-89ab-0123456789ab',name:'Original milk',unit:'1 litre',image_url:'https://example.test/original.jpg',quantity:1,price:450}]};
 context.mock.method(globalThis,'fetch',async (input:RequestInfo|URL)=>{
  const url=String(input);if(url.includes('consume_rate_limit'))return Response.json(true);
  if(url.includes('create_checkout_order'))return unavailable?Response.json({code:'P0001',message:'An item is unavailable. Refresh your basket.'},{status:400}):Response.json({id,subtotal:450,delivery_fee:150,total_amount:600});
  if(url.includes('/rest/v1/orders?'))return Response.json(snapshot);
  throw Error('Unexpected test network destination.');
 });
 const payload={customer_name:'Fictional Customer',customer_phone:'03001234567',delivery_area:'PGECHS Phase 1',delivery_address:'Fictional house, test street',delivery_latitude:31.41216075,delivery_longitude:74.27587375,idempotency_key:crypto.randomUUID(),expected_total:600,items:[{product_id:snapshot.items[0].product_id,quantity:1}]};
 const request=()=>new Request('https://store.test/api/mobile/checkout',{method:'POST',headers:{'x-askari-client':'mobile-v1'},body:JSON.stringify(payload)});
 const rejected=await checkout(request()),problem=await rejected.json() as {code:string};assert.equal(rejected.status,409);assert.equal(problem.code,'ITEM_UNAVAILABLE');assert.equal(rejectedAttempt({status:rejected.status,code:problem.code}),true);
 assert.equal(rejectedAttempt({status:503}),false);assert.equal(rejectedAttempt({status:0}),false);assert.equal(rejectedAttempt({status:409}),false);
 unavailable=false;const confirmed=await checkout(request());assert.equal(confirmed.status,201);const data=await confirmed.json() as {order:import('../mobile/src/types').CustomerReceipt;receipt_token:string};
 const saved=receiptOrder(data.order,[]);assert.equal(saved.created_at,snapshot.created_at);assert.equal(saved.status,'Packing');assert.equal(saved.items[0].product.image_url,snapshot.items[0].image_url);assert.equal(await verifyCustomerReceiptToken(id,data.receipt_token),true);
});
test('Native transport works without AbortSignal.timeout and preserves uncertainty on timeout or broken responses',async context=>{
 context.mock.method(AbortSignal,'timeout',()=>{throw Error('Unavailable in React Native polyfill');});
 context.mock.method(globalThis,'fetch',async (_url:RequestInfo|URL,options?:RequestInit)=>new Promise<Response>((_resolve,reject)=>{options!.signal!.addEventListener('abort',()=>reject(Error('Interrupted')));}));
 await assert.rejects(()=>requestJSON('https://store.test','/api/mobile/config',{},10),error=>error instanceof AppError&&error.status===0&&!rejectedAttempt(error));
 context.mock.method(globalThis,'fetch',async()=>new Response('interrupted JSON',{status:503}));
 await assert.rejects(()=>requestJSON('https://store.test','/api/mobile/checkout'),error=>error instanceof AppError&&error.status===503&&!rejectedAttempt(error));
 context.mock.method(globalThis,'fetch',async()=>Response.json({departments:[]}));
 assert.deepEqual(await requestJSON('https://store.test','/api/mobile/config'),{departments:[]});
});
