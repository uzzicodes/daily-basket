import {test} from 'node:test';
import assert from 'node:assert/strict';
import {categoryPath,productId,productPath} from '../lib/shop-routes';
import {receiptSummary} from '../lib/receipt';
import type {Order} from '../lib/types';
test('Category links and product bookmarks keep their identity across readable title changes',()=>{
 assert.equal(categoryPath('Dairy, Milk & Breakfast'),'/category/dairy-breakfast');
 assert.equal(categoryPath('Cooking & Pantry'),'/category/pantry');
 const id='9a37734f-3827-53c0-ab58-aac2b6fba65d';
 assert.equal(productId(productPath({id,name:'137 Degrees Almond Milk Original 1000 ml'})),id);
 assert.equal(productId('renamed-milk--'+id),id);
 assert.equal(productId('not-a-product'),null);
 assert.equal(productId('../etc/passwd'),null);
});
test('Packing receipt uses the saved order details and cash total without claiming payment received',()=>{
 const order={id:'ORD-snapshot',created_at:'2026-10-15T01:00:00Z',items:[{product_id:'1',name:'Milk as ordered',unit:'1 litre',quantity:2,price:450,image_url:'https://example.com/saved.jpg'},{product_id:'2',name:'Popcorn as ordered',unit:'300 g',quantity:1,price:250,image_url:''}],subtotal:1150,delivery_fee:150,total_amount:1300} as Order;
 const receipt=receiptSummary(order);assert.equal(receipt.units,3);assert.equal(receipt.items[0].lineTotal,900);assert.equal(receipt.items[0].name,'Milk as ordered');assert.equal(receipt.items[0].image_url,'https://example.com/saved.jpg');assert.equal(receipt.total,1300);assert.equal(receipt.delivery,150);assert.equal('cash_received' in receipt,false);assert.equal('lineTotal' in order.items[0],false);
});
