import {database} from './supabase';
import {money} from './constants';
import {receiptSummary} from './receipt';
import type {Order} from './types';
import {createPackingPdf} from './receipt-pdf';

// The webhook is server-only. Reject redirects and all non-Discord destinations.
export function discordWebhook(value=process.env.DISCORD_RECEIPT_WEBHOOK_URL||''){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='discord.com'||u.port||u.username||u.password||u.search||u.hash||!/^\/api\/webhooks\/\d{16,22}\/[A-Za-z0-9_-]{40,}$/.test(u.pathname))return null;u.searchParams.set('wait','true');return u;}catch{return null;}
}
const safe=(s:string,max:number)=>s.replace(/([\\`*_~|>\[\]])/g,'\\$1').slice(0,max);
export function discordReceipt(order:Order){
 const r=receiptSummary(order);
 const full=['DAILY BASKET','PACKING RECEIPT — NOT PROOF OF PAYMENT',r.reference,r.placed,'',order.customer_name,order.customer_phone,order.delivery_area,order.delivery_address,'',...r.items.flatMap((i,n)=>[`${n+1}. ${i.name} · ${i.unit}`,`   ${i.quantity} x ${money(i.price)} = ${money(i.lineTotal)}`]),'',`Products: ${money(r.subtotal)}`,`Delivery: ${money(r.delivery)}`,`Order total (COD): ${money(r.total)}`,'','Packed by: ____________________','Dispatch time: ____________________','Cash handover and payment confirmation are managed by the store owner.'].join('\n');
 const origin=process.env.STORE_PUBLIC_URL||'https://askari-lahore-groceries.jazzylark16.chatgpt.site';
 const link=origin+'/orders?order='+encodeURIComponent(order.id);
 const summary={title:order.id.startsWith('SAMPLE')?'SAMPLE — packing receipt':'New order — packing receipt',color:0x087e78,description:`**${safe(order.customer_name,180)}**\n${safe(order.customer_phone,40)}\n${safe(order.delivery_area,150)}\n${safe(order.delivery_address,600)}`,fields:[{name:'Order',value:safe(r.reference,100)},{name:'Products',value:`${r.items.length} lines · ${r.units} units`,inline:true},{name:'Cash due (COD)',value:money(r.total),inline:true},{name:'Total breakdown',value:`Products ${money(r.subtotal)} + delivery ${money(r.delivery)}`},{name:'Full picture receipt',value:`[Open the private order desk](${link}) · Save image or print`}],footer:{text:`${r.placed} · Packing copy, not proof of payment`}};
 const embeds:Record<string,unknown>[]=[summary];
 return {payload:{username:'Daily Basket Receipts',content:'Picture packing slip attached as PDF · '+r.items.length+' product lines.',allowed_mentions:{parse:[]},embeds,attachments:[{id:0,filename:'Daily Basket-'+order.id+'.pdf',description:'Order desk packing slip with product photos, quantities and COD total'}]},full};
}
export async function sendDiscordReceipt(order:Order,send:typeof fetch=fetch,assets?:Parameters<typeof createPackingPdf>[1]){
 const url=discordWebhook();if(!url)throw Error('DISCORD_NOT_CONFIGURED');
 const {payload}=discordReceipt(order);const origin=process.env.STORE_PUBLIC_URL||'https://askari-lahore-groceries.jazzylark16.chatgpt.site';
 const pdf=await createPackingPdf(order,assets||{font:async name=>{const response=await fetch(new URL('/fonts/'+name,origin),{redirect:'manual',signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('RECEIPT_FONT_UNAVAILABLE');return new Uint8Array(await response.arrayBuffer());}});
 const body=new FormData();body.append('payload_json',JSON.stringify(payload));body.append('files[0]',new Blob([pdf as BlobPart],{type:'application/pdf'}),payload.attachments[0].filename);
 return send(url,{method:'POST',body,redirect:'manual',signal:AbortSignal.timeout(7000)});
}
type Delivery={order_id:string;attempts:number;receipt:Order};
export async function dispatchDiscordReceipts(db=database(),send=sendDiscordReceipt){
 if(!discordWebhook())return {accepted:0,failed:0,configured:false};
 const {data,error}=await db.rpc('claim_discord_receipts',{p_limit:1});if(error)throw Error('DISCORD_QUEUE_UNAVAILABLE');const summary={accepted:0,failed:0,configured:true};
 for(const row of (data||[]) as Delivery[]){let status=0,messageId:string|null=null,retryAfter=0;
  try{const response=await send(row.receipt);status=response.status;if(response.ok){const body=await response.json() as {id?:string};messageId=body.id||null;}else if(status===429){const body=await response.json() as {retry_after?:number};retryAfter=Math.min(3600,Math.max(1,Number(body.retry_after)||0));}}catch{status=0;}
  const ok=status>=200&&status<300&&!!messageId;const permanent=status>=400&&status<500&&status!==408&&status!==429;
  const result=await db.from('discord_receipt_deliveries').update({status:ok?'sent':permanent||row.attempts>=5?'failed':'queued',message_id:messageId,accepted_at:ok?new Date().toISOString():null,lease_until:null,next_attempt_at:new Date(Date.now()+Math.max(retryAfter,Math.min(3600,30*2**row.attempts))*1000).toISOString(),last_error:ok?null:status?'DISCORD_HTTP_'+status:'DISCORD_NETWORK'}).eq('order_id',row.order_id).eq('attempts',row.attempts).eq('status','sending');
  if(result.error)throw Error('DISCORD_QUEUE_UPDATE_FAILED');if(ok)summary.accepted++;else summary.failed++;
  if(status===429)break;
 }
 return summary;
}
