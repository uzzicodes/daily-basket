import { NextResponse } from 'next/server';
import { adminCookie, isAdmin, sameOrigin, ownerSessionToken } from '@/lib/security';
import {ownerAccount,ownerPasswordMatches} from '@/lib/owner-auth';
import { databaseConfigured } from '@/lib/supabase';
import { allowRequest } from '@/lib/rate-limit';
export async function GET(){return NextResponse.json({authenticated:await isAdmin(),configured:!!process.env.ADMIN_PASSWORD&&!!process.env.ADMIN_SESSION_SECRET},{headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403});
  if(!process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_SESSION_SECRET.length<32)return NextResponse.json({error:'Owner sign-in is not configured.'},{status:503});
  if(!databaseConfigured())return NextResponse.json({error:'Connect Supabase before enabling the store counter.'},{status:503});
  try{if(!await allowRequest(request,'admin-login',5,15))return NextResponse.json({error:'Too many sign-in attempts. Try again in 15 minutes.'},{status:429});const raw=await request.text();if(raw.length>2000)return NextResponse.json({error:'Invalid sign-in.'},{status:400});const {password}=JSON.parse(raw),account=await ownerAccount();if(typeof password!=='string'||!await ownerPasswordMatches(password,account))return NextResponse.json({error:'Incorrect password.'},{status:401});const response=NextResponse.json({ok:true});response.cookies.set({...adminCookie,value:await ownerSessionToken(account.auth_version)});return response;}catch{return NextResponse.json({error:'Unable to sign in right now.'},{status:503});}
}
export async function DELETE(request:Request){if(!sameOrigin(request))return NextResponse.json({error:'Invalid origin.'},{status:403});const r=NextResponse.json({ok:true});r.cookies.set({...adminCookie,value:'',maxAge:0});return r;}
