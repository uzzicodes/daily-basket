import {NextResponse} from 'next/server';
import {z} from 'zod';
import {customerReceiptView,mobileRequestAllowed,verifyCustomerReceiptToken} from '@/lib/customer-receipt';
import {database} from '@/lib/supabase';
import {allowRequest} from '@/lib/rate-limit';
import {createPackingPdf} from '@/lib/receipt-pdf';
import type {Order} from '@/lib/types';
const schema=z.object({id:z.string().regex(/^ORD-[\da-f-]{36}$/i),token:z.string().max(100)}).strict();
export async function POST(request:Request){
 if(!mobileRequestAllowed(request))return NextResponse.json({error:'Invalid app request.'},{status:403});
 const raw=await request.text();if(raw.length>500)return NextResponse.json({error:'Invalid receipt.'},{status:400});
 let value;try{value=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid receipt.'},{status:400});}
 const parsed=schema.safeParse(value);
 if(!parsed.success||!await verifyCustomerReceiptToken(parsed.data.id,parsed.data.token))return NextResponse.json({error:'This private receipt is invalid or expired. Contact the store with your reference.'},{status:401});
 try{
  if(!await allowRequest(request,'customer-pdf',10,1))return NextResponse.json({error:'Please wait before downloading another receipt.'},{status:429});
  const {data,error}=await database().from('orders').select('id,status,created_at,subtotal,delivery_fee,total_amount,items,customer_name,customer_phone,delivery_area,delivery_address').eq('id',parsed.data.id).maybeSingle();
  if(error)throw error;if(!data)return NextResponse.json({error:'Order not found.'},{status:404});
  // Deliberately reconstruct the receipt: never pass costs or owner-only fields to a renderer.
  const order:Order={...customerReceiptView(data),customer_name:data.customer_name,customer_phone:data.customer_phone,delivery_area:data.delivery_area,delivery_address:data.delivery_address,payment_method:'Cash on Delivery'};
  const origin=process.env.STORE_PUBLIC_URL||new URL(request.url).origin;
  const bytes=await createPackingPdf(order,{font:async name=>{const response=await fetch(new URL('/fonts/'+name,origin),{redirect:'manual',signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Receipt font unavailable');return new Uint8Array(await response.arrayBuffer());}});
  return new Response(bytes as BodyInit,{headers:{'Content-Type':'application/pdf','Cache-Control':'private, no-store','Content-Disposition':'attachment; filename="receipt-'+order.id+'.pdf"','X-Content-Type-Options':'nosniff'}});
 }catch{return NextResponse.json({error:'Could not prepare the PDF. Your saved order details are still available.'},{status:503});}
}
