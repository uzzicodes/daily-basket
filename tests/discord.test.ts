import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {discordWebhook,discordReceipt,sendDiscordReceipt,dispatchDiscordReceipts} from '../lib/discord';
import type {Order} from '../lib/types';
const order:Order={id:'SAMPLE-DISCORD',created_at:'2026-10-15T10:00:00Z',customer_name:'Sample @everyone',customer_phone:'Sample — no real phone',delivery_area:'Sample area',delivery_address:'Practice receipt only',items:Array.from({length:15},(_,i)=>({product_id:'p'+i,name:'Product '+i,unit:'1 kg',image_url:'https://cdn.shopify.com/example.jpg',quantity:2,price:100})),subtotal:3000,delivery_fee:0,total_amount:3000,payment_method:'Cash on Delivery',status:'Pending'};
const webhook='https://discord.com/api/webhooks/123456789012345678/'+'a'.repeat(68);
test('Discord destination is restricted and complete receipts retain every product beyond embed limits',()=>{
 assert.ok(discordWebhook(webhook));for(const bad of [webhook.replace('discord.com','discord.com.evil.test'),webhook.replace('https:','http:'),webhook+'?redirect=bad',webhook+'#x','https://localhost/api/webhooks/123/token'])assert.equal(discordWebhook(bad),null);
 const {payload,full}=discordReceipt(order);assert.equal(payload.embeds.length,1);assert.deepEqual(payload.allowed_mentions,{parse:[]});for(const item of order.items)assert.ok(full.includes(item.name+' · '+item.unit));assert.ok(full.includes('NOT PROOF OF PAYMENT'));assert.ok(full.includes('3,000'));assert.match(payload.content,/PDF/);
});
test('Discord sending attaches the full receipt and never follows redirects or accepts an unconfirmed message',async()=>{
 process.env.DISCORD_RECEIPT_WEBHOOK_URL=webhook;
 await sendDiscordReceipt(order,async(url,options)=>{assert.equal(new URL(String(url)).hostname,'discord.com');assert.equal(options?.redirect,'manual');const body=options?.body as FormData;const file=body.get('files[0]') as File;assert.equal(file.type,'application/pdf');assert.ok(file.name.endsWith('.pdf'));assert.ok((await file.text()).startsWith('%PDF-'));assert.deepEqual(JSON.parse(body.get('payload_json') as string).allowed_mentions.parse,[]);return Response.json({id:'sample'});},{font:async name=>new Uint8Array(await readFile('public/fonts/'+name)),photo:async()=>null});
 const updates:Record<string,unknown>[]=[];const db={rpc:async()=>({data:[{order_id:order.id,attempts:1,receipt:order}],error:null}),from:()=>({update:(value:Record<string,unknown>)=>{updates.push(value);const chain={eq:()=>chain,then:(resolve:(value:unknown)=>void)=>resolve({error:null})};return chain;}})};
 await dispatchDiscordReceipts(db as never,async()=>Response.json({id:'accepted-message'}));assert.equal(updates[0].status,'sent');assert.equal(updates[0].message_id,'accepted-message');
 await dispatchDiscordReceipts(db as never,async()=>Response.json({retry_after:600},{status:429}));assert.equal(updates[1].status,'queued');assert.ok(Date.parse(updates[1].next_attempt_at as string)>Date.now()+590000);
 await dispatchDiscordReceipts(db as never,async()=>new Response(null,{status:404}));assert.equal(updates[2].status,'failed');
 delete process.env.DISCORD_RECEIPT_WEBHOOK_URL;
});
