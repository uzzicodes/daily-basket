import { NextResponse } from 'next/server';
import {getStaff} from '@/lib/staff';
import {listOperations} from '@/lib/operations';
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
    const actor=await getStaff(request);if(!actor)return NextResponse.json({error:'Use your individual staff account.'},{status:401});const data=await listOperations(actor.role,actor.id,view==='delivered'?'completed':'active',cursor);
    return NextResponse.json(orderPage(((data??[]) as Order[]).map(fulfillmentOrder)),{headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({error:'Unable to load orders. Please refresh.'},{status:503});}
}
export async function PATCH(request:Request){if(!sameOrigin(request)||!await isOrderDesk(request))return NextResponse.json({error:'Please sign in to the order desk.'},{status:401});return NextResponse.json({error:'Use the individual staff order workflow.'},{status:410});}
