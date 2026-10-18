import { NextResponse } from 'next/server';
import { isOrderDesk,sameOrigin,digest } from '@/lib/security';
import { deviceToken,pushConfigured,sendPhoneAlert } from '@/lib/push';
import { database } from '@/lib/supabase';
export async function POST(request:Request){
 const headers={'Cache-Control':'no-store'};
 if(!sameOrigin(request)||!await isOrderDesk(request))return NextResponse.json({error:'Please sign in to the order desk.'},{status:401,headers});
 const token=deviceToken(request);if(!token||!pushConfigured())return NextResponse.json({error:'Enable phone alerts first.'},{status:409,headers});
 try{const {data,error}=await database().from('desk_push_devices').select('subscription').eq('id',await digest(token)).maybeSingle();if(error)throw error;if(!data)return NextResponse.json({error:'Enable phone alerts first.'},{status:409,headers});
 const result=await sendPhoneAlert(data.subscription,{title:'Daily Basket phone alerts are ready',body:'This is a test. New order alerts will open the packing receipt.',tag:'askari-phone-test',url:'/orders'});
 if(!result.ok)throw Error('PUSH_REJECTED');return NextResponse.json({accepted:true},{headers});
 }catch{return NextResponse.json({error:'The push service did not accept the test. Turn alerts off, then enable them again.'},{status:503,headers});}
}
