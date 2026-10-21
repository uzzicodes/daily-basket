import {NextResponse} from 'next/server';
import {z} from 'zod';
import {sameOrigin,digest} from '@/lib/security';
import {database} from '@/lib/supabase';
import {allowRequest} from '@/lib/rate-limit';
import {OWNER_RECOVERY_EMAIL,emailRecoveryConfigured,ownerAccount,sendOwnerRecovery,replaceOwnerPassword} from '@/lib/owner-auth';
const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'};
const schema=z.discriminatedUnion('action',[z.object({action:z.literal('request'),email:z.string().trim().toLowerCase().email().max(160)}).strict(),z.object({action:z.literal('reset'),token:z.string().regex(/^[a-f0-9]{64}$/),new_password:z.string().min(12).max(160)}).strict()]);
export async function GET(){return NextResponse.json({emailConfigured:emailRecoveryConfigured()},{headers});}
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers});try{
 const raw=await request.text();if(raw.length>1600)return NextResponse.json({error:'Invalid recovery request.'},{status:400,headers});const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Check your recovery details.'},{status:400,headers});const p=parsed.data;
 if(!await allowRequest(request,'owner-recovery-'+p.action,p.action==='request'?3:6,15))return NextResponse.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429,headers});
 if(p.action==='request'){
  if(p.email!==OWNER_RECOVERY_EMAIL)return NextResponse.json({error:'Only the configured owner email can recover this account.'},{status:400,headers});
  if(!emailRecoveryConfigured())return NextResponse.json({error:'Email recovery is restricted to your owner email, but its mail sender is not connected yet. You can still change your password while signed in.'},{status:503,headers});
  const db=database(),limit=await db.rpc('consume_rate_limit',{p_key:await digest('owner-recovery-email-global'),p_limit:3,p_window_seconds:3600});if(limit.error)throw limit.error;if(!limit.data)return NextResponse.json({error:'Recovery email limit reached. Try again in an hour.'},{status:429,headers});
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join(''),hash=await digest(token),account=await ownerAccount();const {error}=await db.from('store_owner_resets').insert({token_hash:hash,auth_version:account.auth_version,expires_at:new Date(Date.now()+15*60000).toISOString()});if(error)throw error;
  try{await sendOwnerRecovery(token);}catch(e){await db.from('store_owner_resets').update({used_at:new Date().toISOString()}).eq('token_hash',hash);throw e;}return NextResponse.json({sent:true},{headers});
 }
 const {data,error}=await database().from('store_owner_resets').select('auth_version,expires_at,used_at').eq('token_hash',await digest(p.token)).maybeSingle();if(error)throw error;if(!data||data.used_at||new Date(data.expires_at).getTime()<=Date.now())return NextResponse.json({error:'This link expired or was already used. Request a new one.'},{status:400,headers});await replaceOwnerPassword(p.new_password,data.auth_version,p.token);return NextResponse.json({changed:true},{headers});
 }catch(e){const status=e instanceof SyntaxError?400:(e as {status?:number}).status||503;return NextResponse.json({error:status===409?'This link or owner account changed. Request a new recovery link.':'Recovery could not be completed. Please retry; your password is unchanged unless a reset was confirmed.'},{status,headers});}}
