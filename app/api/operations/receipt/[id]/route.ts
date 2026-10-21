import {NextResponse} from 'next/server';
import {getStaff} from '@/lib/staff';
import {database} from '@/lib/supabase';
import {allowRequest} from '@/lib/rate-limit';
import {operationsFields,operationalView,type OperationalOrder} from '@/lib/operations';
import {createPackingPdf} from '@/lib/receipt-pdf';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const headers={'Cache-Control':'private, no-store'};
 try{const actor=await getStaff(request);if(!actor)return NextResponse.json({error:'Staff sign-in required.'},{status:401,headers});const {id}=await params;if(!/^ORD-[\da-f-]{36}$/i.test(id))return NextResponse.json({error:'Invalid receipt.'},{status:400,headers});
 if(!await allowRequest(request,'staff-receipt-pdf',15,1))return NextResponse.json({error:'Please wait before downloading another receipt.'},{status:429,headers});
 let query=database().from('orders').select(operationsFields).eq('id',id);if(actor.role==='rider')query=query.eq('assigned_rider_id',actor.id);if(actor.role==='packer')query=query.eq('approval_status','approved');const {data,error}=await query.maybeSingle();if(error)throw error;if(!data)return NextResponse.json({error:'This receipt is unavailable for your role.'},{status:404,headers});
 const origin=process.env.STORE_PUBLIC_URL||new URL(request.url).origin;const bytes=await createPackingPdf(operationalView(data as unknown as OperationalOrder),{font:async name=>{const r=await fetch(new URL('/fonts/'+name,origin),{redirect:'manual',signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Receipt font unavailable');return new Uint8Array(await r.arrayBuffer());}});
 return new Response(bytes as BodyInit,{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="Daily-Basket-'+id+'.pdf"','X-Content-Type-Options':'nosniff'}});
 }catch{return NextResponse.json({error:'Could not prepare this receipt. Please retry.'},{status:503,headers});}
}
