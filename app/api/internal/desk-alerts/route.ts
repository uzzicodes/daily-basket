import { NextResponse } from 'next/server';
import { equalSecret } from '@/lib/security';
import { dispatchDeskAlerts } from '@/lib/push';
export async function POST(request:Request){
 const secret=process.env.DESK_PUSH_DISPATCH_SECRET;const bearer=request.headers.get('authorization')||'';
 if(!secret||secret.length<32||!await equalSecret(bearer,'Bearer '+secret))return NextResponse.json({error:'Unauthorized.'},{status:401});
 try{return NextResponse.json(await dispatchDeskAlerts(),{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Phone alerts will retry.'},{status:503});}
}
