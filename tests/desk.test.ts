import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessionToken,verifyToken } from '../lib/security';
import { GET,PATCH } from '../app/api/desk/orders/route';
import { fulfillmentOrder,updateOrderStatus } from '../lib/fulfillment';
import type { Order } from '../lib/types';
test('Staff tokens cannot be replayed as owner sessions, and scope changes invalidate signatures',async()=>{
  process.env.ADMIN_SESSION_SECRET='test-only-secret-for-local-unit-tests-32chars';
  const owner=await sessionToken(),desk=await sessionToken('desk');
  assert.equal(await verifyToken(owner),true);assert.equal(await verifyToken(desk,'desk'),true);
  assert.equal(await verifyToken(desk),false);assert.equal(await verifyToken(owner,'desk'),false);
  assert.equal(await verifyToken(desk.slice(5)),false);assert.equal(await verifyToken('desk.'+owner,'desk'),false);
  assert.equal(await verifyToken(desk+'tamper','desk'),false);assert.equal(await verifyToken('desk.1.random.signature','desk'),false);
  const denial=await GET(new Request('https://store.invalid/api/desk/orders',{headers:{cookie:`askari_desk=${owner}`}}));assert.equal(denial.status,401);
  delete process.env.ADMIN_SESSION_SECRET;
});
test('Order desk endpoints reject anonymous reads, anonymous updates and cross-origin writes',async()=>{
  assert.equal((await GET(new Request('https://store.invalid/api/desk/orders'))).status,401);
  assert.equal((await PATCH(new Request('https://store.invalid/api/desk/orders',{method:'PATCH',headers:{origin:'https://store.invalid'},body:'{}'}))).status,401);
});

test('Staff cannot mark an order paid or delivered, even with a forged cash confirmation',async()=>{
 process.env.ADMIN_SESSION_SECRET='test-only-secret-for-local-unit-tests-32chars';
 const token=await sessionToken('desk');
 const response=await PATCH(new Request('https://store.invalid/api/desk/orders',{method:'PATCH',headers:{origin:'https://store.invalid',cookie:'askari_desk='+token},body:JSON.stringify({id:'ORD-00000000-0000-4000-8000-000000000001',expected_status:'Out for Delivery',status:'Delivered',cash_received:true})}));
 assert.equal(response.status,403);
 const unconfirmed=await updateOrderStatus(new Request('https://store.invalid/api/admin/orders',{method:'PATCH',body:JSON.stringify({id:'ORD-00000000-0000-4000-8000-000000000001',expected_status:'Out for Delivery',status:'Delivered'})}),{canSettle:true});
 assert.equal(unconfirmed.status,400);
 delete process.env.ADMIN_SESSION_SECRET;
});
test('Staff response retains order photos and cash due while discarding internal and accounting fields',()=>{
  const row={id:'ORD-test',customer_name:'Test',customer_phone:'03001234567',delivery_area:'Gulberg',delivery_address:'Test address',created_at:'2026-10-14T10:00:00Z',status:'Pending',payment_method:'Cash on Delivery',subtotal:100,delivery_fee:150,total_amount:250,items:[{product_id:'test',name:'Milk',unit:'1 Litre',image_url:'https://example.com/milk.jpg',quantity:2,price:50,cost_price:30}],request_hash:'private',idempotency_key:'private',profit:40} as unknown as Order;
  const response=fulfillmentOrder(row);assert.equal(response.items[0].image_url,'https://example.com/milk.jpg');assert.equal(response.items[0].unit,'1 Litre');assert.equal(response.total_amount,250);
  assert.equal('profit' in response,false);assert.equal('request_hash' in response,false);assert.equal('idempotency_key' in response,false);assert.equal('cost_price' in response.items[0],false);
});
