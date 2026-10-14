import { buildPushPayload, type PushSubscription } from '@block65/webcrypto-web-push';
import { z } from 'zod';
import { database } from './supabase';
import { digest } from './security';

export const pushCookie={name:'askari_push_device',httpOnly:true,sameSite:'strict' as const,secure:process.env.NODE_ENV==='production',path:'/api/desk',maxAge:30*24*60*60};
export function deviceToken(request:Request){const value=(request.headers.get('cookie')||'').split(';').map(c=>c.trim()).find(c=>c.startsWith(pushCookie.name+'='))?.slice(pushCookie.name.length+1)||'';return /^[a-f0-9]{64}$/.test(value)?value:'';}
export function trustedPushEndpoint(value:string){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hash&&!u.port&&u.pathname.length>1&&(u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com'||u.hostname==='web.push.apple.com'||/^[a-z0-9-]+\.notify\.windows\.com$/.test(u.hostname));}catch{return false;}}
function keyBytes(value:string){try{return Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}catch{return new Uint8Array();}}
export const subscriptionSchema=z.object({endpoint:z.string().max(2048).refine(trustedPushEndpoint,'Unsupported push service.'),expirationTime:z.number().finite().positive().nullable().optional(),keys:z.object({p256dh:z.string().regex(/^[\w-]+={0,2}$/).refine(v=>keyBytes(v).length===65&&keyBytes(v)[0]===4),auth:z.string().regex(/^[\w-]+={0,2}$/).refine(v=>keyBytes(v).length===16)}).strict()}).strict();
export function pushConfigured(){return !!process.env.DESK_PUSH_PUBLIC_KEY&&!!process.env.DESK_PUSH_PRIVATE_KEY&&!!process.env.DESK_PUSH_SUBJECT;}
export function orderAlert(orderId:string,lineCount:number){return {title:'New Askari order',body:`${lineCount} product ${lineCount===1?'line':'lines'} to pack. Tap to open the receipt.`,tag:orderId,url:'/orders?order='+encodeURIComponent(orderId)};}
export async function sendPhoneAlert(subscription:PushSubscription,data:ReturnType<typeof orderAlert>|{title:string;body:string;tag:string;url:string},send:typeof fetch=fetch){
 if(!trustedPushEndpoint(subscription.endpoint))throw Error('INVALID_PUSH_SERVICE');
 const payload=await buildPushPayload({data,options:{ttl:86400,urgency:'high',topic:(await digest(data.tag)).slice(0,32)}},subscription,{publicKey:process.env.DESK_PUSH_PUBLIC_KEY!,privateKey:process.env.DESK_PUSH_PRIVATE_KEY!,subject:process.env.DESK_PUSH_SUBJECT!});
 return send(subscription.endpoint,{...payload,redirect:'error',signal:AbortSignal.timeout(7000)});
}
export async function removeDeskDevice(request:Request){const token=deviceToken(request);if(!token)return;const {error}=await database().from('desk_push_devices').delete().eq('id',await digest(token));if(error)throw Error('DEVICE_REMOVE_FAILED');}
type Delivery={id:string;order_id:string;device_id:string;subscription:PushSubscription;line_count:number;attempts:number};
export async function dispatchDeskAlerts(db=database(),send=sendPhoneAlert){
 if(!pushConfigured())return {accepted:0,failed:0};
 const {data,error}=await db.rpc('claim_desk_push_deliveries',{p_limit:12});if(error)throw Error('PUSH_QUEUE_UNAVAILABLE');
 const summary={accepted:0,failed:0};
 // Small chunks bound network concurrency and stay within the Worker's memory budget.
 const rows=(data||[]) as Delivery[];
 for(let offset=0;offset<rows.length;offset+=4)await Promise.all(rows.slice(offset,offset+4).map(async row=>{
  let status=0;try{status=(await send(row.subscription,orderAlert(row.order_id,row.line_count))).status;}catch{status=0;}
  if(status===404||status===410){const result=await db.from('desk_push_devices').delete().eq('id',row.device_id);if(result.error)throw Error('PUSH_DEVICE_CLEANUP_FAILED');summary.failed++;return;}
  const ok=status>=200&&status<300;const permanent=status!==0&&status>=400&&status<500&&status!==408&&status!==429;
  const result=await db.from('desk_push_deliveries').update({status:ok?'sent':permanent||row.attempts>=5?'failed':'queued',accepted_at:ok?new Date().toISOString():null,lease_until:null,next_attempt_at:new Date(Date.now()+Math.min(3600,30*2**row.attempts)*1000).toISOString(),last_error:ok?null:status?'PUSH_HTTP_'+status:'PUSH_NETWORK'}).eq('id',row.id).eq('attempts',row.attempts).eq('status','sending');
  if(result.error)throw Error('PUSH_QUEUE_UPDATE_FAILED');if(ok)summary.accepted++;else summary.failed++;
 }));
 return summary;
}
