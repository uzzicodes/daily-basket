import { NextResponse } from 'next/server';
import { adminCookie, equalSecret, isAdmin, sameOrigin, sessionToken } from '@/lib/security';
import { databaseConfigured } from '@/lib/supabase';
import { allowRequest } from '@/lib/rate-limit';
export async function GET(){return NextResponse.json({authenticated:await isAdmin(),configured:!!process.env.ADMIN_PASSWORD&&!!process.env.ADMIN_SESSION_SECRET},{headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403});
  if(!process.env.ADMIN_PASSWORD||!process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_SESSION_SECRET.length<32)return NextResponse.json({error:'Set ADMIN_PASSWORD and a 32+ character ADMIN_SESSION_SECRET on the server.'},{status:503});
  if(!databaseConfigured())return NextResponse.json({error:'Connect Supabase before enabling the store counter.'},{status:503});
  try{if(!await allowRequest(request,'admin-login',5,15))return NextResponse.json({error:'Too many sign-in attempts. Try again in 15 minutes.'},{status:429});const raw=await request.text();if(raw.length>2000)return NextResponse.json({error:'Invalid sign-in.'},{status:400});const {password}=JSON.parse(raw);if(typeof password!=='string'||!await equalSecret(password,process.env.ADMIN_PASSWORD))return NextResponse.json({error:'Incorrect password.'},{status:401});const response=NextResponse.json({ok:true});response.cookies.set({...adminCookie,value:await sessionToken()});return response;}catch{return NextResponse.json({error:'Unable to sign in right now.'},{status:503});}
}
export async function DELETE(request:Request){if(!sameOrigin(request))return NextResponse.json({error:'Invalid origin.'},{status:403});const r=NextResponse.json({ok:true});r.cookies.set({...adminCookie,value:'',maxAge:0});return r;}
