import { database } from './supabase';
import { digest } from './security';
// Durable counters across serverless instances. Requires the migration's atomic RPC.
async function requestLimitKey(request:Request,scope:string){
  const ip=request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('cf-connecting-ip') || 'unknown';
  return digest(`${scope}:${ip}`);
}
export async function allowRequest(request:Request,scope:string,limit:number,minutes:number){
  const key=await requestLimitKey(request,scope);
  const {data,error}=await database().rpc('consume_rate_limit',{p_key:key,p_limit:limit,p_window_seconds:minutes*60});
  if(error)throw Error('Rate limit storage unavailable.');return data===true;
}
export async function clearRequestLimit(request:Request,scope:string){
 const {error}=await database().from('api_limits').delete().eq('key',await requestLimitKey(request,scope));
 if(error)throw Error('Could not reset the successful sign-in counter.');
}
