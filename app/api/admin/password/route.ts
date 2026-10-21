import {NextResponse} from 'next/server';
import {z} from 'zod';
import {isAdmin,sameOrigin,adminCookie,ownerSessionToken} from '@/lib/security';
import {ownerAccount,ownerPasswordMatches,replaceOwnerPassword} from '@/lib/owner-auth';
import {allowRequest} from '@/lib/rate-limit';
const headers={'Cache-Control':'no-store'};
const schema=z.object({current_password:z.string().min(1).max(160),new_password:z.string().min(12).max(160)}).strict();
export async function POST(request:Request){if(!sameOrigin(request)||!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});try{
 if(!await allowRequest(request,'owner-password-change',5,15))return NextResponse.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429,headers});const raw=await request.text();if(raw.length>2000)return NextResponse.json({error:'Invalid password request.'},{status:400,headers});const p=schema.safeParse(JSON.parse(raw));if(!p.success)return NextResponse.json({error:'Enter the current password and a new password of at least 12 characters.'},{status:400,headers});const account=await ownerAccount();if(!await ownerPasswordMatches(p.data.current_password,account))return NextResponse.json({error:'The current owner password is incorrect.'},{status:403,headers});if(p.data.current_password===p.data.new_password)return NextResponse.json({error:'Choose a different new password.'},{status:400,headers});const version=await replaceOwnerPassword(p.data.new_password,account.auth_version),r=NextResponse.json({changed:true},{headers});r.cookies.set({...adminCookie,value:await ownerSessionToken(version)});return r;
 }catch(e){return NextResponse.json({error:'Could not change the password. Refresh and retry.'},{status:e instanceof SyntaxError?400:503,headers});}}
