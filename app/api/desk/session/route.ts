import { NextResponse } from 'next/server';
import { deskCookie, isOrderDesk, sameOrigin } from '@/lib/security';
import { removeDeskDevice,pushCookie } from '@/lib/push';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){return NextResponse.json({authenticated:await isOrderDesk(request),configured:!!process.env.ADMIN_SESSION_SECRET},{headers});}
export async function POST(request:Request){if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers});return NextResponse.json({error:'Shared desk passwords have been retired. Use your individual staff account at /orders.'},{status:410,headers});}
export async function DELETE(request:Request){if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers});try{await removeDeskDevice(request);const response=NextResponse.json({ok:true},{headers});response.cookies.set({...deskCookie,value:'',maxAge:0});response.cookies.set({...pushCookie,value:'',maxAge:0});return response;}catch{return NextResponse.json({error:'Could not sign out safely. Please retry.'},{status:503,headers});}}
