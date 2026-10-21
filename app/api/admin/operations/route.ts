import {NextResponse} from 'next/server';
import {isAdmin,sameOrigin} from '@/lib/security';
import {database} from '@/lib/supabase';
import {actionSchema,listOperations,performAction,operationError,operationsFields,operationalView,type OperationalOrder} from '@/lib/operations';
import {decodeOrderCursor,orderPage} from '@/lib/order-pagination';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){if(!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});try{
 const p=new URL(request.url).searchParams,days=Number(p.get('days')??30),view=p.get('view')||'all';if(![0,1,7,30,90].includes(days)||!['all','active','completed','cash','review'].includes(view))return NextResponse.json({error:'Invalid report period.'},{status:400,headers});
 let cursor;try{cursor=p.has('before')?decodeOrderCursor(p.get('before')!):undefined;}catch{return NextResponse.json({error:'Invalid page cursor.'},{status:400,headers});}
 const focused=p.get('order');if(focused&&!/^ORD-[\da-f-]{36}$/i.test(focused))return NextResponse.json({error:'Invalid order reference.'},{status:400,headers});
 const loadOrders=async()=>{if(!focused)return listOperations('owner',null,view,cursor);const {data,error}=await database().from('orders').select(operationsFields).eq('id',focused).maybeSingle();if(error)throw error;return data?[operationalView(data as unknown as OperationalOrder)]:[];};
 const [orders,summaryResult,ridersResult]=await Promise.all([loadOrders(),database().rpc('store_business_summary',{p_days:days}),database().from('store_staff').select('id,display_name').eq('role','rider').eq('active',true).order('display_name')]);
 if(summaryResult.error||ridersResult.error)throw summaryResult.error||ridersResult.error;
 return NextResponse.json({...orderPage(orders),summary:summaryResult.data,riders:ridersResult.data},{headers});
 }catch(e){const d=operationError(e);return NextResponse.json({error:d.error},{status:d.status,headers});}}
export async function PATCH(request:Request){if(!sameOrigin(request)||!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});try{
 const raw=await request.text();if(raw.length>12000)return NextResponse.json({error:'Invalid action.'},{status:400,headers});const parsed=actionSchema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Invalid action.'},{status:400,headers});
 return NextResponse.json({order:await performAction(parsed.data,null,true)},{headers});
 }catch(e){const d=operationError(e);return NextResponse.json({error:d.error},{status:d.status,headers});}}
