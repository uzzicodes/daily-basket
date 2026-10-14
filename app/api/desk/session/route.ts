import { NextResponse } from 'next/server';
import { deskCookie, equalSecret, isOrderDesk, sameOrigin, sessionToken } from '@/lib/security';
import { databaseConfigured } from '@/lib/supabase';
import { allowRequest } from '@/lib/rate-limit';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){return NextResponse.json({authenticated:await isOrderDesk(request),configured:!!process.env.ORDER_DESK_PASSWORD&&!!process.env.ADMIN_SESSION_SECRET},{headers});}
export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers});
  if(!process.env.ORDER_DESK_PASSWORD||!process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_SESSION_SECRET.length<32||!databaseConfigured())return NextResponse.json({error:'Order desk sign-in is not ready. Please contact the owner.'},{status:503,headers});
  try{
    if(!await allowRequest(request,'desk-login',5,15))return NextResponse.json({error:'Too many attempts. Please try again in 15 minutes.'},{status:429,headers});
    const raw=await request.text();if(raw.length>2000)return NextResponse.json({error:'Invalid sign-in.'},{status:400,headers});
    const {password}=JSON.parse(raw);if(typeof password!=='string')return NextResponse.json({error:'Enter your order desk password.'},{status:400,headers});
    const staff=await equalSecret(password,process.env.ORDER_DESK_PASSWORD);
    const owner=process.env.ADMIN_PASSWORD?await equalSecret(password,process.env.ADMIN_PASSWORD):false;
    if(!staff&&!owner)return NextResponse.json({error:'Incorrect password.'},{status:401,headers});
    const response=NextResponse.json({ok:true},{headers});response.cookies.set({...deskCookie,value:await sessionToken('desk')});return response;
  }catch{return NextResponse.json({error:'Unable to sign in. Please retry.'},{status:503,headers});}
}
export async function DELETE(request:Request){if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers});const response=NextResponse.json({ok:true},{headers});response.cookies.set({...deskCookie,value:'',maxAge:0});return response;}
