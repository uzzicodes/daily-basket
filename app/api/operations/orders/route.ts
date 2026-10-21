import {NextResponse} from 'next/server';
import {getStaff,staffMutationAllowed} from '@/lib/staff';
import {actionSchema,listOperations,performAction,operationError} from '@/lib/operations';
import {decodeOrderCursor,orderPage} from '@/lib/order-pagination';
import {database} from '@/lib/supabase';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request){try{
 const actor=await getStaff(request);if(!actor)return NextResponse.json({error:'Please sign in with your staff account.'},{status:401,headers});
 const p=new URL(request.url).searchParams,view=p.get('view')||'active';if(!['active','completed','all','cash','review'].includes(view))return NextResponse.json({error:'Invalid queue.'},{status:400,headers});
 let cursor;try{cursor=p.has('before')?decodeOrderCursor(p.get('before')!):undefined;}catch{return NextResponse.json({error:'Invalid page cursor.'},{status:400,headers});}
 const orders=await listOperations(actor.role,actor.id,view,cursor);
 const {data:riders,error}=actor.role==='manager'?await database().from('store_staff').select('id,display_name').eq('role','rider').eq('active',true).order('display_name'):{data:[],error:null};if(error)throw error;
 const waiting=actor.role==='packer'?await database().from('orders').select('id',{count:'exact',head:true}).eq('status','Pending').eq('approval_status','pending'):null;
 return NextResponse.json({...orderPage(orders),riders},{headers});
 }catch(e){const d=operationError(e);return NextResponse.json({error:d.error},{status:d.status,headers});}}
export async function PATCH(request:Request){if(!staffMutationAllowed(request))return NextResponse.json({error:'Invalid request origin.'},{status:403,headers});try{
 const actor=await getStaff(request);if(!actor)return NextResponse.json({error:'Please sign in.'},{status:401,headers});
 const raw=await request.text();if(raw.length>12000)return NextResponse.json({error:'Invalid action.'},{status:400,headers});const parsed=actionSchema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Invalid order action.'},{status:400,headers});
 return NextResponse.json({order:await performAction(parsed.data,actor)},{headers});
 }catch(e){const d=operationError(e);return NextResponse.json({error:d.error},{status:d.status,headers});}}
