import {equalSecret,sameOrigin} from './security';
import type {Order} from './types';
export function customerReceiptView(order:Pick<Order,'id'|'status'|'created_at'|'subtotal'|'delivery_fee'|'total_amount'|'items'>){return {id:order.id,status:order.status,created_at:order.created_at,subtotal:order.subtotal,delivery_fee:order.delivery_fee,total_amount:order.total_amount,items:order.items.map(item=>({product_id:item.product_id,name:item.name,unit:item.unit,image_url:item.image_url,quantity:item.quantity,price:item.price}))};}
const lifetime=90*24*60*60*1000;
export function mobileRequestAllowed(request:Request){
 if(request.headers.get('x-askari-client')!=='mobile-v1')return false;
 if(request.headers.has('origin'))return sameOrigin(request);
 return !request.headers.has('sec-fetch-site');
}
async function signature(id:string,expiry:string){
 const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)throw Error('Receipt signing is not configured.');
 const encoder=new TextEncoder();const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode('customer-receipt.v1.'+id+'.'+expiry))),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function issueCustomerReceiptToken(id:string,now=Date.now()){
 if(!/^ORD-[\da-f-]{36}$/i.test(id))throw Error('Invalid saved order reference.');
 const expires=String(now+lifetime);return expires+'.'+await signature(id,expires);
}
export async function verifyCustomerReceiptToken(id:string,token:string,now=Date.now()){
 if(!/^ORD-[\da-f-]{36}$/i.test(id))return false;const [expiry,mac,...extra]=token.split('.');
 if(extra.length||!/^\d{13}$/.test(expiry||'')||!/^[a-f0-9]{64}$/.test(mac||'')||Number(expiry)<=now||Number(expiry)>now+lifetime+60000)return false;
 try{return await equalSecret(mac,await signature(id,expiry));}catch{return false;}
}
