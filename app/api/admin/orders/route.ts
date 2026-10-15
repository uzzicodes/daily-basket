import { NextResponse } from 'next/server';
import { database } from '@/lib/supabase';
import { isAdmin, sameOrigin } from '@/lib/security';
import {updateOrderStatus} from '@/lib/fulfillment';
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
export async function PATCH(request:Request){
  if(!sameOrigin(request)||!await isAdmin())return NextResponse.json({error:'Please sign in.'},{status:401});
  return updateOrderStatus(request,{canSettle:true});
}
