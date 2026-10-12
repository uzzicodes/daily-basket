import { NextResponse } from 'next/server';
import { orderSchema } from '@/lib/order';
import { database, databaseConfigured } from '@/lib/supabase';
import { allowRequest } from '@/lib/rate-limit';
import { digest, sameOrigin } from '@/lib/security';
export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403});
  const raw=await request.text();if(raw.length>20000)return NextResponse.json({error:'Order is too large.'},{status:413});
  let value;try{value=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid order format.'},{status:400});}
  const parsed=orderSchema.safeParse(value);if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0].message},{status:400});
  if(!databaseConfigured())return NextResponse.json({error:'Online COD ordering is not connected yet. Please contact the store.'},{status:503});
  try {
    if(!await allowRequest(request,'checkout',10,15))return NextResponse.json({error:'Too many order attempts. Please try again in 15 minutes.'},{status:429,headers:{'Retry-After':'900'}});
    const {idempotency_key,items,...customer}=parsed.data;
    const requestHash=await digest(JSON.stringify({...customer,items}));
    const {data,error}=await database().rpc('create_checkout_order',{p_customer:customer,p_items:items,p_key:idempotency_key,p_hash:requestHash});
    if(error){if(['P0001','23514','22P02'].includes(error.code))return NextResponse.json({error:error.code==='P0001'?error.message:'Some order details are invalid.'},{status:409});console.error('Order persistence failed',error.code);return NextResponse.json({error:'We could not save your order. Please try again.'},{status:503});}
    return NextResponse.json({order:data},{status:201,headers:{'Cache-Control':'no-store'}});
  }catch {return NextResponse.json({error:'Ordering is temporarily unavailable. Please try again.'},{status:503});}
}
