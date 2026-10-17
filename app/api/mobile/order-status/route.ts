import {NextResponse} from 'next/server';
import {z} from 'zod';
import {customerReceiptView,mobileRequestAllowed,verifyCustomerReceiptToken} from '@/lib/customer-receipt';
import {database} from '@/lib/supabase';
import {allowRequest} from '@/lib/rate-limit';
const schema=z.object({id:z.string().regex(/^ORD-[\da-f-]{36}$/i),token:z.string().max(100)}).strict();
export async function POST(request:Request){
 if(!mobileRequestAllowed(request))return NextResponse.json({error:'Invalid app request.'},{status:403});
 const raw=await request.text();if(raw.length>500)return NextResponse.json({error:'Invalid receipt.'},{status:400});
 let value;try{value=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid receipt.'},{status:400});}const parsed=schema.safeParse(value);
 if(!parsed.success||!await verifyCustomerReceiptToken(parsed.data.id,parsed.data.token))return NextResponse.json({error:'This private receipt link is invalid or expired. Contact Askari with your order reference.'},{status:401});
 try{if(!await allowRequest(request,'customer-status',120,1))return NextResponse.json({error:'Please wait before refreshing again.'},{status:429});const {data,error}=await database().from('orders').select('id,status,created_at,subtotal,delivery_fee,total_amount,items').eq('id',parsed.data.id).maybeSingle();if(error)throw error;if(!data)return NextResponse.json({error:'Order not found. Contact Askari with your reference.'},{status:404});return NextResponse.json({order:customerReceiptView(data)},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Could not refresh this order. Your saved receipt is still available.'},{status:503});}
}
