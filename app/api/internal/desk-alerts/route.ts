import { NextResponse } from 'next/server';
import { equalSecret } from '@/lib/security';
import { dispatchOrderNotifications } from '@/lib/notifications';
export async function POST(request:Request){
 const secret=process.env.DESK_PUSH_DISPATCH_SECRET;const bearer=request.headers.get('authorization')||'';
 if(!secret||secret.length<32||!await equalSecret(bearer,'Bearer '+secret))return NextResponse.json({error:'Unauthorized.'},{status:401});
 try{return NextResponse.json(await dispatchOrderNotifications(),{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Order alerts will retry.'},{status:503});}
}
