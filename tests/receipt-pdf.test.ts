import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';
import {createPackingPdf,receiptPhoto} from '../lib/receipt-pdf';
import type {Order} from '../lib/types';
test('Picture receipt paginates long orders and handles Unicode and missing photos without losing the document',async()=>{
 const order:Order={id:'SAMPLE-PAGINATION',created_at:'2026-10-15T10:00:00Z',customer_name:'عزیر / Sample',customer_phone:'Sample',delivery_area:'Sample area',delivery_address:'A'.repeat(400),items:Array.from({length:30},(_,i)=>({product_id:'p'+i,name:'Long product name, exact size and variant '+i,unit:'1000 ml',image_url:'',quantity:2,price:100})),subtotal:6000,delivery_fee:0,total_amount:6000,payment_method:'Cash on Delivery',status:'Pending'};
 const bytes=await createPackingPdf(order,{font:async name=>new Uint8Array(await readFile('public/fonts/'+name)),photo:async()=>null});const pdf=await PDFDocument.load(bytes);assert.ok(pdf.getPageCount()>1);assert.equal(pdf.getTitle(),'Daily Basket packing receipt SAMPLE-PAGINATION');
});
test('Receipt photo loading rejects arbitrary destinations, redirects and oversized responses',async()=>{
 let requests=0;const send=async()=>{requests++;return new Response(null,{status:302,headers:{Location:'https://private.invalid'}});};assert.equal(await receiptPhoto('https://private.invalid/photo.jpg',send),null);assert.equal(requests,0);assert.equal(await receiptPhoto('https://cdn.shopify.com/photo.jpg',send),null);assert.equal(requests,1);assert.equal(await receiptPhoto('https://cdn.shopify.com/photo.jpg',async()=>new Response(new Uint8Array(2_000_001))),null);
});
