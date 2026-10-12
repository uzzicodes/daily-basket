import { database } from './supabase';
import { digest } from './security';
// Durable counters across serverless instances. Requires the migration's atomic RPC.
export async function allowRequest(request:Request,scope:string,limit:number,minutes:number){
  const ip=request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('cf-connecting-ip') || 'unknown';
  const key=await digest(`${scope}:${ip}`);
  const {data,error}=await database().rpc('consume_rate_limit',{p_key:key,p_limit:limit,p_window_seconds:minutes*60});
  if(error)throw Error('Rate limit storage unavailable.');return data===true;
}
