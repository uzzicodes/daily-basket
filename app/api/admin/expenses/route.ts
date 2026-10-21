import {NextResponse} from 'next/server';
import {z} from 'zod';
import {isAdmin,sameOrigin} from '@/lib/security';
import {database} from '@/lib/supabase';
const headers={'Cache-Control':'no-store'};
const schema=z.object({request_key:z.string().uuid(),expense_date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),amount:z.number().finite().positive().max(9999999999.99).refine(v=>Math.abs(v*100-Math.round(v*100))<0.00001),category:z.string().trim().min(2).max(60),note:z.string().trim().min(2).max(400)}).strict();
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});try{const {data,error}=await database().from('store_expenses').select('id,expense_date,amount,category,note').order('expense_date',{ascending:false}).limit(100);if(error)throw error;return NextResponse.json({expenses:data},{headers});}catch{return NextResponse.json({error:'Could not load expenses.'},{status:503,headers});}}
export async function POST(request:Request){if(!sameOrigin(request)||!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});try{
 const raw=await request.text();if(raw.length>1600)return NextResponse.json({error:'Invalid expense.'},{status:400,headers});const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Enter the expense date, amount, category and description.'},{status:400,headers});
 const day=new Date(parsed.data.expense_date+'T00:00:00Z');if(!Number.isFinite(day.getTime())||day.toISOString().slice(0,10)!==parsed.data.expense_date)return NextResponse.json({error:'Enter a valid expense date.'},{status:400,headers});
 const db=database(),value=parsed.data;const {data:old,error:oldError}=await db.from('store_expenses').select('*').eq('request_key',value.request_key).maybeSingle();if(oldError)throw oldError;
 if(old){if(['expense_date','amount','category','note'].some(key=>String(old[key])!==String(value[key as keyof typeof value])))return NextResponse.json({error:'This saved expense changed. Refresh before adding another.'},{status:409,headers});return NextResponse.json({saved:true},{headers});}
 const {error}=await db.from('store_expenses').insert(value);if(error){if(error.code==='23505')return NextResponse.json({error:'This expense is already being saved. Refresh the ledger before retrying.'},{status:409,headers});throw error;}
 return NextResponse.json({saved:true},{headers});
 }catch{return NextResponse.json({error:'Could not save the expense. Retry safely.'},{status:503,headers});}}
