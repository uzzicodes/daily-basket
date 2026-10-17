import {after,NextResponse} from 'next/server';
import {dispatchOrderNotifications} from './notifications';
import {orderSchema} from './order';
import {database,databaseConfigured} from './supabase';
import {allowRequest} from './rate-limit';
import {digest} from './security';
import {customerReceiptView,issueCustomerReceiptToken} from './customer-receipt';

// Web and native clients share validation, pricing, idempotency and receipt dispatch.
export async function submitCheckout(request:Request,{customerReceipt=false}={}){
 const raw=await request.text();if(raw.length>20000)return NextResponse.json({error:'Order is too large.'},{status:413});
 let value;try{value=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid order format.'},{status:400});}
 const parsed=orderSchema.safeParse(value);if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0].message},{status:400});
 if(!databaseConfigured())return NextResponse.json({error:'Online COD ordering is not connected yet. Please contact the store.'},{status:503});
 try{
  if(!await allowRequest(request,'checkout',10,15))return NextResponse.json({error:'Too many order attempts. Please try again in 15 minutes.'},{status:429,headers:{'Retry-After':'900'}});
  const {idempotency_key,items,expected_total,...customer}=parsed.data;
  const requestHash=await digest(JSON.stringify({...customer,items,expected_total}));
  const {data,error}=await database().rpc('create_checkout_order',{p_customer:customer,p_items:items,p_key:idempotency_key,p_hash:requestHash,p_expected_total:expected_total});
  if(error){if(['P0001','23514','22P02'].includes(error.code))return NextResponse.json({error:error.code==='P0001'?error.message:'Some order details are invalid.',code:error.message.startsWith('Prices have changed.')?'PRICE_CHANGED':error.message==='An item is unavailable. Refresh your basket.'?'ITEM_UNAVAILABLE':undefined},{status:409});console.error('Order persistence failed',error.code);return NextResponse.json({error:'We could not save your order. Please try again.'},{status:503});}
  try{after(async()=>{await dispatchOrderNotifications();});}catch{console.error('Order notification queues will retry.');}
  if(customerReceipt){
   const snapshot=await database().from('orders').select('id,status,created_at,subtotal,delivery_fee,total_amount,items').eq('id',data.id).single();
   if(snapshot.error||!snapshot.data)throw Error('Receipt snapshot unavailable.');
   return NextResponse.json({order:customerReceiptView(snapshot.data),receipt_token:await issueCustomerReceiptToken(data.id)},{status:201,headers:{'Cache-Control':'no-store'}});
  }
  return NextResponse.json({order:data},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Ordering is temporarily unavailable. Please try again.'},{status:503});}
}
