import { NextResponse } from 'next/server';
import { z } from 'zod';
import { database } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/constants';
const querySchema=z.object({q:z.string().trim().max(100).default(''),category:z.string().refine(v=>v==='All'||CATEGORIES.includes(v)).default('All'),brands:z.array(z.string().max(100)).max(20).default([]),available:z.boolean().default(false),sort:z.enum(['az','za','low','high']).default('az'),offset:z.coerce.number().int().min(0).max(100000).default(0),ids:z.array(z.string().uuid()).max(60).optional()});
export async function GET(request:Request){
 const u=new URL(request.url);const p=querySchema.safeParse({q:u.searchParams.get('q')??undefined,category:u.searchParams.get('category')??undefined,brands:u.searchParams.getAll('brand'),available:u.searchParams.get('available')==='true',sort:u.searchParams.get('sort')??undefined,offset:u.searchParams.get('offset')??undefined,ids:u.searchParams.has('ids')?u.searchParams.get('ids')!.split(','):undefined});
 if(!p.success)return NextResponse.json({error:'Invalid catalog filters.'},{status:400});
 try{const v=p.data;const {data,error}=await database().rpc('browse_catalog',{p_search:v.q,p_category:v.category,p_brands:v.brands,p_available:v.available,p_sort:v.sort,p_offset:v.offset,p_limit:v.ids?60:48,p_ids:v.ids??null});if(error)throw error;return NextResponse.json(data,{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'The catalog could not be loaded. Please retry.'},{status:503});}
}
