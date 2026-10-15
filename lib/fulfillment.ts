import { NextResponse } from 'next/server';
import { z } from 'zod';
import { database } from './supabase';
import type { Order } from './types';
// Explicit fields keep internal accounting, request hashes and future owner fields out of staff responses.
export function fulfillmentOrder(order:Order):Order{return {id:order.id,customer_name:order.customer_name,customer_phone:order.customer_phone,delivery_area:order.delivery_area,delivery_address:order.delivery_address,delivery_latitude:order.delivery_latitude,delivery_longitude:order.delivery_longitude,delivery_distance_km:order.delivery_distance_km,created_at:order.created_at,status:order.status,payment_method:order.payment_method,subtotal:order.subtotal,delivery_fee:order.delivery_fee,total_amount:order.total_amount,items:order.items.map(i=>({product_id:i.product_id,name:i.name,unit:i.unit,image_url:i.image_url,quantity:i.quantity,price:i.price}))};}
const schema=z.object({id:z.string().regex(/^ORD-[\da-f-]{36}$/i),status:z.enum(['Pending','Packing','Out for Delivery','Delivered']),expected_status:z.enum(['Pending','Packing','Out for Delivery','Delivered']),cash_received:z.boolean().optional()}).strict();
export async function updateOrderStatus(request:Request,{canSettle=false}:{canSettle?:boolean}={}){
  try{
    const raw=await request.text();if(raw.length>2000)return NextResponse.json({error:'Invalid status request.'},{status:400});
    let value:unknown;try{value=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid status request.'},{status:400});}
    const parsed=schema.safeParse(value);if(!parsed.success)return NextResponse.json({error:'Invalid status.'},{status:400});
    if(parsed.data.status==='Delivered'&&!canSettle)return NextResponse.json({error:'Only the owner can confirm delivery and cash received.'},{status:403});
    if(parsed.data.status==='Delivered'&&parsed.data.cash_received!==true)return NextResponse.json({error:'Confirm that you have received the cash before closing this order.'},{status:400});
    const sequence=['Pending','Packing','Out for Delivery','Delivered'];if(sequence.indexOf(parsed.data.status)!==sequence.indexOf(parsed.data.expected_status)+1)return NextResponse.json({error:'Orders must move forward one stage at a time.'},{status:409});
    const {data,error}=await database().from('orders').update({status:parsed.data.status}).eq('id',parsed.data.id).eq('status',parsed.data.expected_status).select('id,status').maybeSingle();
    if(error)throw error;if(!data)return NextResponse.json({error:'This order has changed. Refresh before trying again.'},{status:409});
    return NextResponse.json({order:data},{headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({error:'Could not update the order. Please retry.'},{status:503});}
}
