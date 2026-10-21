import {test} from 'node:test';
import assert from 'node:assert/strict';
import {customerOrderProgress,refreshActiveReceipts} from '../mobile/src/order-progress';
test('Customer progress has exactly three stages; internal packing and payment do not add customer stages',()=>{
 for(const language of ['en','ur'] as const){
  assert.equal(customerOrderProgress('Pending',language).steps.length,3);
  assert.equal(customerOrderProgress('Pending',language).stage,0);
  assert.equal(customerOrderProgress('Packing',language).stage,0);
  assert.equal(customerOrderProgress('Out for Delivery',language).stage,1);
  assert.equal(customerOrderProgress('Dispatched',language).stage,1);
  assert.equal(customerOrderProgress('Delivered',language).stage,2);
  assert.equal(customerOrderProgress('Cancelled',language).stage,-1);
  assert.equal(customerOrderProgress('Cancelled',language).cancelled,true);
 }
});
test('Automatic status refresh skips terminal receipts and one unavailable receipt cannot stop other updates',async()=>{
 const called:string[]=[];
 const results=await refreshActiveReceipts([{id:'packing',status:'Packing'},{id:'expired',status:'Pending'},{id:'rider',status:'Out for Delivery'},{id:'done',status:'Delivered'},{id:'cancelled',status:'Cancelled'}],async id=>{called.push(id);if(id==='expired')throw Error('Receipt expired');return 'fresh';});
 assert.deepEqual(called,['packing','expired','rider']);assert.deepEqual(results.map(r=>r.status),['fulfilled','rejected','fulfilled']);
});
