import {NextResponse} from 'next/server';
import {z} from 'zod';
import {isAdmin,sameOrigin} from '@/lib/security';
import {database} from '@/lib/supabase';
import {staffPassword} from '@/lib/staff';
const headers={'Cache-Control':'no-store'};
const schema=z.object({id:z.string().uuid().optional(),username:z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9._-]{2,39}$/),display_name:z.string().trim().min(2).max(80),role:z.enum(['manager','packer','rider']),active:z.boolean().default(true),password:z.string().min(8).max(160).optional()}).strict();
const fields='id,username,display_name,role,active,auth_version,created_at';
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});try{const {data,error}=await database().from('store_staff').select(fields).order('created_at');if(error)throw error;return NextResponse.json({staff:data},{headers});}catch{return NextResponse.json({error:'Could not load the team.'},{status:503,headers});}}
export async function POST(request:Request){if(!sameOrigin(request)||!await isAdmin())return NextResponse.json({error:'Owner access required.'},{status:401,headers});try{
 const raw=await request.text();if(raw.length>1600)return NextResponse.json({error:'Invalid staff account.'},{status:400,headers});const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success){const field=parsed.error.issues[0]?.path[0];return NextResponse.json({error:field==='password'?'Use a password between 8 and 160 characters.':field==='username'?'Username must be 3–40 characters: lowercase letters, numbers, dots, underscores or hyphens.':field==='display_name'?'Enter a staff name with at least two characters.':'Choose a valid staff role and account details.'},{status:400,headers});}if(!parsed.data.id&&!parsed.data.password)return NextResponse.json({error:'Set a password of at least eight characters for the new staff account.'},{status:400,headers});
 const value=parsed.data,db=database();let auth_version=1;
 if(value.id){const {data,error}=await db.from('store_staff').select('auth_version').eq('id',value.id).maybeSingle();if(error)throw error;if(!data)return NextResponse.json({error:'Staff member not found.'},{status:404,headers});auth_version=data.auth_version+1;}
 const credentials=value.password?{credential_salt:crypto.randomUUID(),credential_hash:''}:{} as {credential_salt?:string;credential_hash?:string};
 if(value.password)credentials.credential_hash=await staffPassword(value.password,credentials.credential_salt!);
 const row={username:value.username,display_name:value.display_name,role:value.role,active:value.active,auth_version,...credentials};
 const {data,error}=value.id?await db.from('store_staff').update(row).eq('id',value.id).eq('auth_version',auth_version-1).select(fields).maybeSingle():await db.from('store_staff').insert(row).select(fields).single();
 if(error){if(error.code==='23505')return NextResponse.json({error:'That username is already in use.'},{status:409,headers});throw error;}if(!data)return NextResponse.json({error:'This account changed. Refresh and retry.'},{status:409,headers});
 await db.from('store_audit_events').insert({actor_role:'owner',action:value.id?'update_staff':'create_staff',detail:{staff_id:data.id,role:data.role,active:data.active}});
 return NextResponse.json({staff:data},{headers});
 }catch(e){return NextResponse.json({error:e instanceof SyntaxError?'Invalid staff account.':'Could not save this staff account. Please retry.'},{status:e instanceof SyntaxError?400:503,headers});}}
