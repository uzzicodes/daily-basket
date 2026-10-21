import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DELIVERY_LOCATION,deliveryDistanceKm,withinDeliveryRange,deliveryPinUrl } from '../lib/delivery';
import { customerSchema } from '../lib/order';
import { POST } from '../app/api/orders/route';
function north(km:number){return {latitude:DELIVERY_LOCATION.latitude+km/6371*180/Math.PI,longitude:DELIVERY_LOCATION.longitude};}
test('Delivery radius includes the store, nearby pins and exactly 7 km; it excludes just over the boundary',()=>{
  assert.equal(deliveryDistanceKm(DELIVERY_LOCATION),0);assert.equal(withinDeliveryRange(north(6.999)),true);assert.equal(withinDeliveryRange(north(7)),true);assert.equal(withinDeliveryRange(north(7.001)),false);assert.equal(withinDeliveryRange(null),false);assert.equal(withinDeliveryRange({latitude:NaN,longitude:74}),false);assert.equal(withinDeliveryRange({latitude:91,longitude:74}),false);
  assert.ok(deliveryDistanceKm({latitude:31.47,longitude:74.40})>7);assert.match(deliveryPinUrl(DELIVERY_LOCATION),/31\.4121608,74\.2758738/);
});
test('Checkout requires an explicit valid delivery pin and rejects out-of-range pins before any database write',async()=>{
  const customer={customer_name:'Delivery Test',customer_phone:'03001234567',delivery_area:'PGECHS Phase 1',delivery_address:'House 12 Street 4 Block C2',delivery_latitude:DELIVERY_LOCATION.latitude,delivery_longitude:DELIVERY_LOCATION.longitude};
  assert.equal(customerSchema.safeParse(customer).success,true);assert.equal(customerSchema.safeParse({...customer,delivery_latitude:undefined}).success,false);
  const outside={...customer,delivery_latitude:north(7.1).latitude};assert.equal(customerSchema.safeParse(outside).success,false);
  const response=await POST(new Request('https://store.invalid/api/orders',{method:'POST',headers:{origin:'https://store.invalid'},body:JSON.stringify({...outside,items:[{product_id:crypto.randomUUID(),quantity:1}],idempotency_key:crypto.randomUUID(),expected_total:1150})}));assert.equal(response.status,400);assert.match((await response.json() as {error:string}).error,/within 7 km/);
});
