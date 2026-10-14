import { NextResponse } from 'next/server';
import { isOrderDesk,sameOrigin,digest } from '@/lib/security';
import { database } from '@/lib/supabase';
import { deviceToken,pushCookie,pushConfigured,subscriptionSchema,removeDeskDevice } from '@/lib/push';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){
 if(!await isOrderDesk(request))return NextResponse.json({error:'Please sign in to the order desk.'},{status:401,headers});
 try{const token=deviceToken(request);let enabled=false;if(token){const {data,error}=await database().from('desk_push_devices').select('id').eq('id',await digest(token)).maybeSingle();if(error)throw error;enabled=!!data;if(enabled)await database().from('desk_push_devices').update({last_seen_at:new Date().toISOString()}).eq('id',await digest(token));}
 return NextResponse.json({configured:pushConfigured(),publicKey:process.env.DESK_PUSH_PUBLIC_KEY||null,enabled},{headers});}catch{return NextResponse.json({error:'Could not check phone alerts. Please retry.'},{status:503,headers});}
}
export async function POST(request:Request){
 if(!sameOrigin(request)||!await isOrderDesk(request))return NextResponse.json({error:'Please sign in to the order desk.'},{status:401,headers});
 if(!pushConfigured())return NextResponse.json({error:'Phone alerts are not configured yet.'},{status:503,headers});
 try{const raw=await request.text();if(raw.length>5000)return NextResponse.json({error:'Invalid phone registration.'},{status:400,headers});let value:unknown;try{value=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid phone registration.'},{status:400,headers});}
 const parsed=subscriptionSchema.safeParse(value);if(!parsed.success)return NextResponse.json({error:'Invalid or unsupported push subscription.'},{status:400,headers});
 const db=database();const token=deviceToken(request)||Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
 const id=await digest(token);const {data:existing}=await db.from('desk_push_devices').select('id').eq('id',id).maybeSingle();
 if(!existing){const {count,error}=await db.from('desk_push_devices').select('id',{count:'exact',head:true});if(error)throw error;if((count||0)>=20)return NextResponse.json({error:'The store has 20 registered devices. Turn off alerts on an old device first.'},{status:409,headers});}
 const endpoint_hash=await digest(parsed.data.endpoint);const record={id,endpoint_hash,subscription:{...parsed.data,expirationTime:parsed.data.expirationTime??null},last_seen_at:new Date().toISOString()};
 const {data:previous,error:lookupError}=await db.from('desk_push_devices').select('id').eq('endpoint_hash',endpoint_hash).maybeSingle();if(lookupError)throw lookupError;
 // Rebind an existing browser subscription after its cookie was cleared; queued alerts follow the FK.
 const {error}=previous&&previous.id!==id?await db.from('desk_push_devices').update(record).eq('id',previous.id):await db.from('desk_push_devices').upsert(record,{onConflict:'id'});if(error)throw error;
 const response=NextResponse.json({enabled:true},{headers});response.cookies.set({...pushCookie,value:token});return response;
 }catch{return NextResponse.json({error:'Could not register this phone. Turn alerts off, then try again.'},{status:503,headers});}
}
export async function DELETE(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers});
 try{await removeDeskDevice(request);const response=NextResponse.json({enabled:false},{headers});response.cookies.set({...pushCookie,value:'',maxAge:0});return response;}catch{return NextResponse.json({error:'Could not turn off alerts. Please retry.'},{status:503,headers});}
}
