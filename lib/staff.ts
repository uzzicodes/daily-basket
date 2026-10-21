import {database} from './supabase';
import {equalSecret,sameOrigin} from './security';

export type StaffRole='manager'|'packer'|'rider';
export type StaffActor={id:string;username:string;display_name:string;role:StaffRole;auth_version:number};
export const staffCookie={name:'daily_basket_staff',httpOnly:true,sameSite:'strict' as const,secure:process.env.NODE_ENV==='production',path:'/api',maxAge:8*60*60};
const encoder=new TextEncoder();
const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');
async function mac(value:string){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)throw Error('Staff sign-in is unavailable.');const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(value)));}
export async function staffPassword(password:string,salt:string){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:100000},key,256));}
export async function issueStaffToken(actor:StaffActor){const body=['staff-v1',actor.id,actor.auth_version,Date.now()+8*60*60*1000,crypto.randomUUID()].join('.');return body+'.'+await mac(body);}
export async function verifyStaffSignature(token:string,now=Date.now()){
 const pieces=token.split('.');if(pieces.length!==6||pieces[0]!=='staff-v1'||!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(pieces[1])||!/^\d+$/.test(pieces[2])||!/^\d{13}$/.test(pieces[3])||Number(pieces[3])<=now||Number(pieces[3])>now+8*60*60*1000)return null;
 try{if(!await equalSecret(pieces[5],await mac(pieces.slice(0,5).join('.'))))return null;return {id:pieces[1],auth_version:Number(pieces[2])};}catch{return null;}
}
export async function getStaff(request:Request):Promise<StaffActor|null>{
 const bearer=request.headers.get('authorization');
 const token=bearer?.startsWith('Bearer ')?bearer.slice(7):(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(staffCookie.name+'='))?.slice(staffCookie.name.length+1)||'';
 const signed=await verifyStaffSignature(token);if(!signed)return null;
 const {data,error}=await database().from('store_staff').select('id,username,display_name,role,auth_version,active').eq('id',signed.id).maybeSingle();
 if(error||!data?.active||data.auth_version!==signed.auth_version)return null;
 return {id:data.id,username:data.username,display_name:data.display_name,role:data.role,auth_version:data.auth_version};
}
export function staffMutationAllowed(request:Request){if(request.headers.has('origin'))return sameOrigin(request);return request.headers.get('x-daily-basket-client')==='staff-v1'&&!request.headers.has('sec-fetch-site');}
export function publicStaff(actor:StaffActor){return {id:actor.id,username:actor.username,display_name:actor.display_name,role:actor.role};}
