import { NextResponse } from 'next/server';
import { database } from '@/lib/supabase';
import { isOrderDesk, sameOrigin } from '@/lib/security';
import { decodeOrderCursor, orderPage, ORDER_PAGE_SIZE } from '@/lib/order-pagination';
import { fulfillmentOrder, updateOrderStatus } from '@/lib/fulfillment';
import type { Order } from '@/lib/types';
export async function GET(request:Request){
  if(!await isOrderDesk(request))return NextResponse.json({error:'Please sign in to the order desk.'},{status:401});
  const params=new URL(request.url).searchParams;const view=params.get('view')||'active';
  if(!['active','delivered'].includes(view))return NextResponse.json({error:'Invalid order view.'},{status:400});
  let cursor:ReturnType<typeof decodeOrderCursor>|undefined;
  if(params.get('before')){try{cursor=decodeOrderCursor(params.get('before')!);}catch{return NextResponse.json({error:'Invalid page cursor.'},{status:400});}}
  try{
    const {data,error}=await database().rpc('list_desk_orders',{p_view:view,p_before:cursor?.created_at??null,p_before_id:cursor?.id??null,p_limit:ORDER_PAGE_SIZE+1});if(error)throw error;
    return NextResponse.json(orderPage(((data??[]) as Order[]).map(fulfillmentOrder)),{headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({error:'Unable to load orders. Please refresh.'},{status:503});}
}
export async function PATCH(request:Request){if(!sameOrigin(request)||!await isOrderDesk(request))return NextResponse.json({error:'Please sign in to the order desk.'},{status:401});return updateOrderStatus(request);}
