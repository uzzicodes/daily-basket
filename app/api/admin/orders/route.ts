import { NextResponse } from 'next/server';
import { database } from '@/lib/supabase';
import { isAdmin, sameOrigin } from '@/lib/security';
import { z } from 'zod';
import { decodeOrderCursor, orderPage, ORDER_PAGE_SIZE } from '@/lib/order-pagination';
import type { Order } from '@/lib/types';
export async function GET(request:Request){
  if(!await isAdmin())return NextResponse.json({error:'Please sign in.'},{status:401});
  const before=new URL(request.url).searchParams.get('before');
  let cursor:ReturnType<typeof decodeOrderCursor>|undefined;
  if(before){try{cursor=decodeOrderCursor(before);}catch{return NextResponse.json({error:'Invalid page cursor.'},{status:400});}}
  try{
    const db=database();
    const {data,error}=await db.rpc('list_store_orders',{p_before:cursor?.created_at??null,p_before_id:cursor?.id??null,p_limit:ORDER_PAGE_SIZE+1});
    if(error)throw error;
    const {data:metrics,error:metricsError}=await db.rpc('today_metrics');if(metricsError)throw metricsError;
    return NextResponse.json({...orderPage((data??[]) as Order[]),metrics},{headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({error:'Unable to load orders. Please retry.'},{status:503});}
}
const changeSchema=z.object({id:z.string().regex(/^ORD-[\da-f-]{36}$/i),status:z.enum(['Pending','Packing','Out for Delivery','Delivered']),expected_status:z.enum(['Pending','Packing','Out for Delivery','Delivered'])}).strict();
export async function PATCH(request:Request){
  if(!sameOrigin(request)||!await isAdmin())return NextResponse.json({error:'Please sign in.'},{status:401});
  try{const raw=await request.text();if(raw.length>2000)return NextResponse.json({error:'Invalid status request.'},{status:400});const parsed=changeSchema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Invalid status.'},{status:400});const sequence=['Pending','Packing','Out for Delivery','Delivered'];if(sequence.indexOf(parsed.data.status)!==sequence.indexOf(parsed.data.expected_status)+1)return NextResponse.json({error:'Orders must move forward one stage at a time.'},{status:409});const {data,error}=await database().from('orders').update({status:parsed.data.status}).eq('id',parsed.data.id).eq('status',parsed.data.expected_status).select('id,status').maybeSingle();if(error)throw error;if(!data)return NextResponse.json({error:'This order has changed. Refresh the pipeline.'},{status:409});return NextResponse.json({order:data});}catch{return NextResponse.json({error:'Could not update the order. Please retry.'},{status:503});}
}
