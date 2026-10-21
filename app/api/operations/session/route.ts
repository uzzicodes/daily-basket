import {NextResponse} from 'next/server';
import {z} from 'zod';
import {database} from '@/lib/supabase';
import {equalSecret} from '@/lib/security';
import {allowRequest} from '@/lib/rate-limit';
import {getStaff,staffMutationAllowed,staffCookie,staffPassword,issueStaffToken,publicStaff,type StaffActor} from '@/lib/staff';
const headers={'Cache-Control':'no-store'};
const schema=z.object({username:z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9._-]{2,39}$/),password:z.string().min(8).max(160)}).strict();
export async function GET(request:Request){try{const actor=await getStaff(request);return NextResponse.json({actor:actor?publicStaff(actor):null},{headers});}catch{return NextResponse.json({error:'Unable to check staff access.'},{status:503,headers});}}
export async function POST(request:Request){
 if(!staffMutationAllowed(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers});
 try{
  if(!await allowRequest(request,'staff-login',8,15))return NextResponse.json({error:'Too many sign-in attempts. Try again in 15 minutes.'},{status:429,headers});
  const raw=await request.text();if(raw.length>1200)return NextResponse.json({error:'Invalid sign-in.'},{status:400,headers});
  const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Enter your staff username and password.'},{status:400,headers});
  const {data,error}=await database().from('store_staff').select('id,username,display_name,role,credential_salt,credential_hash,auth_version,active').eq('username',parsed.data.username).maybeSingle();if(error)throw error;
  const hash=await staffPassword(parsed.data.password,data?.credential_salt||'unavailable-staff-login-dummy-salt');
  if(!data?.active||!await equalSecret(hash,data.credential_hash))return NextResponse.json({error:'Incorrect staff username or password.'},{status:401,headers});
  const actor=data as StaffActor,token=await issueStaffToken(actor),native=request.headers.get('x-daily-basket-client')==='staff-v1'&&!request.headers.has('origin');
  const response=NextResponse.json({actor:publicStaff(actor),...(native?{token}:{})},{headers});if(!native)response.cookies.set({...staffCookie,value:token});return response;
 }catch(error){if(error instanceof SyntaxError)return NextResponse.json({error:'Invalid sign-in request.'},{status:400,headers});return NextResponse.json({error:'Unable to sign in. Please retry.'},{status:503,headers});}
}
export async function DELETE(request:Request){if(!staffMutationAllowed(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers});const response=NextResponse.json({ok:true},{headers});response.cookies.set({...staffCookie,value:'',maxAge:0});return response;}
