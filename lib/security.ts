import { cookies } from 'next/headers';
const encoder=new TextEncoder();
const COOKIE='askari_admin';
function hex(bytes:ArrayBuffer){return Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');}
export async function digest(value:string){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
export async function equalSecret(a:string,b:string){return (await digest(a))===(await digest(b));}
async function sign(payload:string){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret || secret.length<32)throw Error('Administrator session secret is not configured.');const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(payload)));}
export async function sessionToken(){const payload=`${Date.now()+8*60*60*1000}.${crypto.randomUUID()}`;return `${payload}.${await sign(payload)}`;}
export async function verifyToken(token:string){const pieces=token.split('.');if(pieces.length!==3||!/^\d+$/.test(pieces[0])||Number(pieces[0])<Date.now()||Number(pieces[0])>Date.now()+8*60*60*1000)return false;try{return await equalSecret(pieces[2],await sign(`${pieces[0]}.${pieces[1]}`));}catch{return false;}}
export async function isAdmin(){return verifyToken((await cookies()).get(COOKIE)?.value || '');}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(!origin||request.headers.get('sec-fetch-site')==='cross-site')return false;try{const actual=new URL(origin);if(!['http:','https:'].includes(actual.protocol))return false;if(process.env.APP_ORIGIN)return actual.origin===new URL(process.env.APP_ORIGIN).origin;const expected=new URL(request.url);const host=request.headers.get('host')||expected.host;return actual.host===host&&actual.protocol===expected.protocol;}catch{return false;}}
export const adminCookie={name:COOKIE,httpOnly:true,sameSite:'strict' as const,secure:process.env.NODE_ENV==='production',path:'/api/admin',maxAge:8*60*60};
