import {NextResponse} from 'next/server';
import {z} from 'zod';
import {isAdmin,sameOrigin} from '@/lib/security';
import {database} from '@/lib/supabase';
const headers={'Cache-Control':'no-store'};
const orderId=z.string().regex(/^ORD-[\da-f-]{36}$/i);
const amount=z.number().finite().nonnegative().max(9999999999.99).refine(v=>Math.abs(v*100-Math.round(v*100))<0.00001);
const schema=z.object({order_id:orderId,costs:z.array(z.object({product_id:z.string().uuid(),unit_cost:amount}).strict()).min(1).max(60),delivery_cost:amount,save_future:z.boolean().default(false)}).strict();
export async function GET(request:Request){if(!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});const id=new URL(request.url).searchParams.get('order');if(!orderId.safeParse(id).success)return NextResponse.json({error:'Invalid order.'},{status:400,headers});try{
 const [costs,finance]=await Promise.all([database().from('store_order_costs').select('product_id,quantity,unit_cost').eq('order_id',id),database().from('store_order_finance').select('delivery_cost').eq('order_id',id).maybeSingle()]);if(costs.error||finance.error)throw costs.error||finance.error;
 return NextResponse.json({costs:costs.data,delivery_cost:finance.data?.delivery_cost??null},{headers});
 }catch{return NextResponse.json({error:'Could not load purchase costs.'},{status:503,headers});}}
export async function PATCH(request:Request){if(!sameOrigin(request)||!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});try{
 const raw=await request.text();if(raw.length>10000)return NextResponse.json({error:'Invalid costs.'},{status:400,headers});const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Enter a valid purchase cost for every line and the actual delivery cost.'},{status:400,headers});
 const {data,error}=await database().rpc('save_store_order_costs',{p_order_id:parsed.data.order_id,p_costs:parsed.data.costs,p_delivery_cost:parsed.data.delivery_cost,p_save_future:parsed.data.save_future});if(error)return NextResponse.json({error:'The costs did not match this order. Refresh before retrying.'},{status:409,headers});return NextResponse.json({saved:data},{headers});
 }catch{return NextResponse.json({error:'Could not save purchase costs.'},{status:503,headers});}}
