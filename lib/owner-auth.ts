import {database} from './supabase';
import {staffPassword} from './staff';
import {digest,equalSecret} from './security';
export const OWNER_RECOVERY_EMAIL='uzair.business.2003@gmail.com';
export type OwnerAccount={auth_version:number;credential_salt:string|null;credential_hash:string|null};
export async function ownerAccount():Promise<OwnerAccount>{const {data,error}=await database().from('store_owner_credentials').select('auth_version,credential_salt,credential_hash').eq('singleton',true).single();if(error||!data)throw Error('Owner account unavailable');return data;}
export async function ownerPasswordMatches(password:string,account:OwnerAccount){if(account.credential_hash&&account.credential_salt)return equalSecret(await staffPassword(password,account.credential_salt),account.credential_hash);return !!process.env.ADMIN_PASSWORD&&equalSecret(password,process.env.ADMIN_PASSWORD);}
export async function replaceOwnerPassword(password:string,version:number,resetToken?:string){const salt=crypto.randomUUID(),hash=await staffPassword(password,salt);const {data,error}=await database().rpc('replace_store_owner_password',{p_version:version,p_salt:salt,p_hash:hash,p_reset_hash:resetToken?await digest(resetToken):null});if(error)throw Object.assign(Error('This account or reset link changed. Sign in or request a new link.'),{status:409});return data as number;}
export function emailRecoveryConfigured(){return !!process.env.OWNER_RECOVERY_EMAIL_KEY&&!!process.env.OWNER_RECOVERY_EMAIL_FROM&&!!process.env.STORE_PUBLIC_URL;}
export async function sendOwnerRecovery(token:string,send:typeof fetch=fetch){
 if(!emailRecoveryConfigured())throw Error('Owner recovery email delivery is not connected yet.');
 const base=new URL(process.env.STORE_PUBLIC_URL!);if(base.protocol!=='https:')throw Error('A secure public store URL is required.');
 const link=new URL('/owner/recover',base);link.hash='token='+token;
 const r=await send('https://api.resend.com/emails',{method:'POST',redirect:'manual',headers:{Authorization:'Bearer '+process.env.OWNER_RECOVERY_EMAIL_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.OWNER_RECOVERY_EMAIL_FROM,to:[OWNER_RECOVERY_EMAIL],subject:'Daily Basket · Reset your owner password',text:'A password reset was requested for your Daily Basket owner account.\n\nOpen this single-use link within 15 minutes:\n'+link.href+'\n\nIf you did not request this, ignore this email. Your password has not changed. Never forward this link to staff or anyone else.'}),signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw Error('The email service could not send the owner recovery link.');const body=await r.json() as {id?:string};if(!body.id)throw Error('Email delivery was not confirmed.');
}
