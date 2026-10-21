import {NextResponse} from 'next/server';
import {getStaff} from '@/lib/staff';
import {database} from '@/lib/supabase';
import {operationsFields,operationalView,type OperationalOrder} from '@/lib/operations';
const headers={'Cache-Control':'no-store'};
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const actor=await getStaff(request);if(!actor)return NextResponse.json({error:'Please sign in.'},{status:401,headers});
 const {id}=await params;if(!/^ORD-[\da-f-]{36}$/i.test(id))return NextResponse.json({error:'Invalid order.'},{status:400,headers});
 let query=database().from('orders').select(operationsFields).eq('id',id);if(actor.role==='rider')query=query.eq('assigned_rider_id',actor.id);
 const {data,error}=await query.maybeSingle();if(error)throw error;if(!data)return NextResponse.json({error:'This order is unavailable for your role.'},{status:404,headers});return NextResponse.json({order:operationalView(data as unknown as OperationalOrder)},{headers});
 }catch{return NextResponse.json({error:'Could not open this order.'},{status:503,headers});}}
