import {test} from 'node:test';
import assert from 'node:assert/strict';
import {displayName,rememberQuery,mergeProducts,deliveryProgress,listMessage,repeatIds} from '../mobile/src/domain';
import {POST as receipt} from '../app/api/mobile/receipt/route';
import type {Product,SavedOrder} from '../mobile/src/types';
import {issueCustomerReceiptToken} from '../lib/customer-receipt';
import {readFile} from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';
const product:Product={id:'p1',name:'137 Degrees Almond Milk',brand:'137 Degrees',unit:'1 litre',category:'Dairy',image_url:'',price:450,in_stock:true};
test('Shopping history preserves numeric brands and deduplicates normalised searches',()=>{
 assert.equal(displayName(product),'137 Degrees Almond Milk');
 assert.equal(displayName({...product,name:'001. 137 Degrees Almond Milk',catalog_code:'001.'}),'137 Degrees Almond Milk');
 assert.deepEqual(rememberQuery(['MILK','tea'],'  Milk  '),['Milk','tea']);
 assert.equal(rememberQuery(Array.from({length:10},(_,i)=>String(i)),'rice').length,8);
 assert.deepEqual(rememberQuery(['tea'],'   '),['tea']);
});
test('Saved lists refresh prices and reject unavailable products while respecting basket limits',()=>{
 const result=mergeProducts([{product,quantity:98}],[{product_id:'p1',quantity:3},{product_id:'p2',quantity:2},{product_id:'missing',quantity:1}],[{...product,price:500},{...product,id:'p2',in_stock:false}]);
 assert.equal(result.lines[0].quantity,99);assert.equal(result.lines[0].product.price,500);assert.equal(result.added,1);assert.equal(result.unavailable,2);assert.equal(result.limited,1);
 const full=Array.from({length:50},(_,i)=>({product:{...product,id:'old'+i},quantity:1}));
 assert.equal(mergeProducts(full,[{product_id:'p1',quantity:1}],[product]).lines.length,50);
 assert.equal(mergeProducts(full,[{product_id:'p1',quantity:1}],[product]).limited,1);
});
test('Delivery progress has exact fee boundaries; shared lists include only outstanding items',()=>{
 assert.deepEqual(deliveryProgress(2998,2999),{remaining:1,fraction:2998/2999});
 assert.deepEqual(deliveryProgress(3500,2999),{remaining:0,fraction:1});
 assert.equal(deliveryProgress(-1,2999).fraction,0);
 assert.equal(listMessage('Weekly shop',[{text:'Milk',checked:false},{text:'Tea',checked:true}]),'Weekly shop\n• Milk');
 assert.deepEqual(repeatIds([{items:[{product},{product}]} as SavedOrder]),['p1']);
});
test('Receipt PDFs require a private order token before database access',async()=>{
 const request=(body:string,headers:Record<string,string>={'x-askari-client':'mobile-v1'})=>new Request('https://store.test/api/mobile/receipt',{method:'POST',headers,body});
 assert.equal((await receipt(request('{}',{}))).status,403);
 assert.equal((await receipt(request('{bad'))).status,400);
 assert.equal((await receipt(request('x'.repeat(501)))).status,400);
 assert.equal((await receipt(request(JSON.stringify({id:'ORD-01234567-1234-4567-89ab-0123456789ab',token:'guessed'})))).status,401);
});
test('A valid receipt token downloads its own picture PDF and cannot fetch a different order',async context=>{
 process.env.SUPABASE_URL='https://receipt-pdf.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='test-only-service-key';process.env.ADMIN_SESSION_SECRET='test-only-receipt-signing-key-long-enough';
 context.after(()=>{delete process.env.SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;delete process.env.ADMIN_SESSION_SECRET;});
 const id='ORD-01234567-1234-4567-89ab-0123456789ab',token=await issueCustomerReceiptToken(id);let orderQueries=0;
 context.mock.method(globalThis,'fetch',async(input:RequestInfo|URL)=>{
  const url=new URL(String(input));
  if(url.pathname.includes('consume_rate_limit'))return Response.json(true);
  if(url.pathname.includes('/rest/v1/orders')){orderQueries++;assert.equal(url.searchParams.get('id'),'eq.'+id);assert.doesNotMatch(url.searchParams.get('select')||'',/cost|profit|cash_received/);return Response.json({id,status:'Packing',created_at:'2026-10-18T00:00:00Z',subtotal:450,delivery_fee:150,total_amount:600,customer_name:'Fictional customer',customer_phone:'Test only',delivery_area:'Test area',delivery_address:'Fictional address',items:[{product_id:'p1',name:'Milk',unit:'1 litre',image_url:'',quantity:1,price:450}]});}
  if(url.pathname.startsWith('/fonts/'))return new Response(await readFile('public'+url.pathname));
  throw Error('Unexpected test request');
 });
 const request=(orderId:string)=>new Request('https://store.test/api/mobile/receipt',{method:'POST',headers:{'x-askari-client':'mobile-v1'},body:JSON.stringify({id:orderId,token})});
 assert.equal((await receipt(request(id.replace('89ab','89ac')))).status,401);assert.equal(orderQueries,0);
 const result=await receipt(request(id));assert.equal(result.status,200);assert.equal(orderQueries,1);assert.equal(result.headers.get('Cache-Control'),'private, no-store');assert.equal(result.headers.get('Content-Type'),'application/pdf');
 const pdf=await PDFDocument.load(await result.arrayBuffer());assert.equal(pdf.getTitle(),'Daily Basket packing receipt '+id);assert.ok(pdf.getPageCount()>=1);
});
