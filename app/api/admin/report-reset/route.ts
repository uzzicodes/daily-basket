import {NextResponse} from 'next/server';
import {z} from 'zod';
import {isAdmin,sameOrigin} from '@/lib/security';
import {database} from '@/lib/supabase';
const headers={'Cache-Control':'no-store'};
const schema=z.discriminatedUnion('action',[
 z.object({action:z.literal('reset'),request_id:z.string().uuid(),snapshot:z.string().regex(/^[a-f0-9]{32}$/),confirmation:z.literal('EXCLUDE TEST ORDERS')}).strict(),
 z.object({action:z.literal('restore'),reset_id:z.string().uuid()}).strict(),
]);
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});try{const {data,error}=await database().rpc('preview_store_report_reset');if(error)throw error;return NextResponse.json(data,{headers});}catch{return NextResponse.json({error:'Unable to load test-reset totals. Refresh to retry.'},{status:503,headers});}}
export async function POST(request:Request){if(!sameOrigin(request)||!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});try{const raw=await request.text();if(raw.length>1500)return NextResponse.json({error:'Invalid reset request.'},{status:400,headers});const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return NextResponse.json({error:'Review the totals and confirm these are test orders.'},{status:400,headers});const p=parsed.data;const {data,error}=p.action==='reset'?await database().rpc('reset_store_test_reports',{p_request_id:p.request_id,p_snapshot:p.snapshot}):await database().rpc('restore_store_test_reports',{p_reset_id:p.reset_id});if(error){if(error.code==='P0001')return NextResponse.json({error:error.message},{status:409,headers});throw error;}return NextResponse.json({ok:true,result:data},{headers});}catch(e){return NextResponse.json({error:e instanceof SyntaxError?'Invalid reset request.':'Unable to change test-report exclusions. Refresh to retry.'},{status:e instanceof SyntaxError?400:503,headers});}}
