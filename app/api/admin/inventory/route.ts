import { NextResponse } from 'next/server';
import { database } from '@/lib/supabase';
import { isAdmin,sameOrigin,digest } from '@/lib/security';
import { inventoryImportSchema } from '@/lib/inventory';
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Please sign in.'},{status:401});try{const {data,error}=await database().rpc('inventory_snapshot');if(error)throw error;return NextResponse.json(data,{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Unable to load inventory. Please retry.'},{status:503});}}
export async function POST(request:Request){
 if(!sameOrigin(request)||!await isAdmin())return NextResponse.json({error:'Please sign in.'},{status:401});
 try{
  const reader=request.body?.getReader();if(!reader)return NextResponse.json({error:'Choose a price list.'},{status:400});let size=0;const chunks:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>5*1024*1024){await reader.cancel();return NextResponse.json({error:'The price list is too large.'},{status:413});}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  let value;try{value=JSON.parse(new TextDecoder().decode(bytes));}catch{return NextResponse.json({error:'Invalid price list format.'},{status:400});}
  const parsed=inventoryImportSchema.safeParse(value);if(!parsed.success)return NextResponse.json({error:'Invalid prices or product rows. Review the file before importing.'},{status:400});
  const {rows,idempotency_key,file_name,revision}=parsed.data;if(new Set(rows.map(r=>r.product_id)).size!==rows.length)return NextResponse.json({error:'Remove duplicate product rows.'},{status:400});
  const hash=await digest(JSON.stringify({rows,file_name,revision}));const {data,error}=await database().rpc('apply_inventory_prices',{p_rows:rows,p_key:idempotency_key,p_file_name:file_name,p_hash:hash,p_revision:revision});
  if(error)return NextResponse.json({error:error.code==='P0001'?error.message:'The inventory could not be updated. Nothing was imported.'},{status:error.code==='P0001'?409:503});
  return NextResponse.json({import:data},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'The inventory could not be updated. Please retry.'},{status:503});}
}
