import { cookies } from 'next/headers';
const encoder=new TextEncoder();
const COOKIE='askari_admin';
function hex(bytes:ArrayBuffer){return Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');}
export async function digest(value:string){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
export async function equalSecret(a:string,b:string){return (await digest(a))===(await digest(b));}
async function sign(payload:string){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret || secret.length<32)throw Error('Administrator session secret is not configured.');const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(payload)));}
export async function sessionToken(scope:'owner'|'desk'='owner'){const payload=`${scope==='desk'?'desk.':''}${Date.now()+8*60*60*1000}.${crypto.randomUUID()}`;return `${payload}.${await sign(payload)}`;}
export async function verifyToken(token:string,scope:'owner'|'desk'='owner'){
  const pieces=token.split('.');if(scope==='desk'){if(pieces.shift()!=='desk')return false;}
  if(pieces.length!==3||!/^\d+$/.test(pieces[0])||Number(pieces[0])<Date.now()||Number(pieces[0])>Date.now()+8*60*60*1000)return false;
  try{return await equalSecret(pieces[2],await sign(`${scope==='desk'?'desk.':''}${pieces[0]}.${pieces[1]}`));}catch{return false;}
}
export async function ownerSessionToken(version:number){const body=['owner-v1',version,Date.now()+8*60*60*1000,crypto.randomUUID()].join('.');return body+'.'+await sign(body);}
export async function verifyOwnerSession(token:string,version:number){if(version===1&&await verifyToken(token))return true;const p=token.split('.');if(p.length!==5||p[0]!=='owner-v1'||p[1]!==String(version)||!/^\d{13}$/.test(p[2])||Number(p[2])<=Date.now()||Number(p[2])>Date.now()+8*60*60*1000)return false;try{return await equalSecret(p[4],await sign(p.slice(0,4).join('.')));}catch{return false;}}
export async function isAdmin(){const token=(await cookies()).get(COOKIE)?.value||'';if(!token)return false;try{const {ownerAccount}=await import('./owner-auth');return verifyOwnerSession(token,(await ownerAccount()).auth_version);}catch{return false;}}
export async function isOrderDesk(request:Request){const {getStaff}=await import('./staff');const actor=await getStaff(request);return actor?.role==='packer'||actor?.role==='manager';}
export const deskCookie={name:'askari_desk',httpOnly:true,sameSite:'strict' as const,secure:process.env.NODE_ENV==='production',path:'/api/desk',maxAge:8*60*60};
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(!origin||request.headers.get('sec-fetch-site')==='cross-site')return false;try{const actual=new URL(origin);if(!['http:','https:'].includes(actual.protocol))return false;if(process.env.APP_ORIGIN)return actual.origin===new URL(process.env.APP_ORIGIN).origin;const expected=new URL(request.url);const host=request.headers.get('host')||expected.host;return actual.host===host&&actual.protocol===expected.protocol;}catch{return false;}}
export const adminCookie={name:COOKIE,httpOnly:true,sameSite:'strict' as const,secure:process.env.NODE_ENV==='production',path:'/api/admin',maxAge:8*60*60};
