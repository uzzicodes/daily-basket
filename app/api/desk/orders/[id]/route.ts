import { NextResponse } from 'next/server';
import { isOrderDesk } from '@/lib/security';
import { database } from '@/lib/supabase';
import { fulfillmentOrder } from '@/lib/fulfillment';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const headers={'Cache-Control':'no-store'};
 if(!await isOrderDesk(request))return NextResponse.json({error:'Please sign in to the order desk.'},{status:401,headers});
 const {id}=await params;if(!/^ORD-[\da-f-]{36}$/i.test(id))return NextResponse.json({error:'Invalid order.'},{status:400,headers});
 try{const {data,error}=await database().from('orders').select('*').eq('id',id).maybeSingle();if(error)throw error;if(!data)return NextResponse.json({error:'This order was not found.'},{status:404,headers});return NextResponse.json({order:fulfillmentOrder(data)},{headers});}catch{return NextResponse.json({error:'Could not open this receipt. Please retry.'},{status:503,headers});}
}
