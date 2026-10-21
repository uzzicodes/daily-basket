import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {digest,sessionToken,ownerSessionToken,verifyOwnerSession} from '../lib/security';
import {staffPassword} from '../lib/staff';
import {OWNER_RECOVERY_EMAIL,ownerPasswordMatches,sendOwnerRecovery} from '../lib/owner-auth';
import {POST as recovery} from '../app/api/admin/recovery/route';
const db=new PGlite();
before(async()=>{await db.exec('create role anon;create role authenticated;create role service_role bypassrls;grant usage on schema public to anon,authenticated,service_role;alter default privileges in schema public grant all on tables to anon,authenticated,service_role;alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;create function public.rls_auto_enable() returns event_trigger language plpgsql security definer as $$begin end$$;');for(const f of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')&&!f.endsWith('_scheduler.sql')).sort())await db.exec(await readFile('supabase/migrations/'+f,'utf8'));});
after(async()=>db.close());
test('Owner password replacement consumes a single-use expiring reset and revokes older owner versions',async()=>{
 const raw='ab'.repeat(32),hash=await digest(raw),salt=crypto.randomUUID(),password='isolated-long-password',credential=await staffPassword(password,salt);
 await db.query('insert into store_owner_resets(token_hash,auth_version,expires_at) values($1,1,now()+interval \'15 minutes\')',[hash]);
 await assert.rejects(()=>db.query('select replace_store_owner_password(1,$1,$2,$3)',[salt,credential,'ff'.repeat(32)]),/expired or already used/);
 assert.equal((await db.query<{v:number}>('select auth_version as v from store_owner_credentials')).rows[0].v,1);
 const version=await db.query<{v:number}>('select replace_store_owner_password(1,$1,$2,$3) as v',[salt,credential,hash]);assert.equal(version.rows[0].v,2);
 await assert.rejects(()=>db.query('select replace_store_owner_password(2,$1,$2,$3)',[salt,credential,hash]),/expired or already used/);
 const expired=await digest('cd'.repeat(32));await db.query('insert into store_owner_resets(token_hash,auth_version,expires_at) values($1,2,now()-interval \'1 minute\')',[expired]);await assert.rejects(()=>db.query('select replace_store_owner_password(2,$1,$2,$3)',[salt,credential,expired]),/expired or already used/);
 process.env.ADMIN_SESSION_SECRET='isolated-owner-secret-at-least-thirty-two';process.env.ADMIN_PASSWORD='original-environment-password';
 const legacy=await sessionToken(),current=await ownerSessionToken(2);assert.equal(await verifyOwnerSession(legacy,1),true);assert.equal(await verifyOwnerSession(legacy,2),false);assert.equal(await verifyOwnerSession(current,2),true);assert.equal(await verifyOwnerSession(current,3),false);assert.equal(await verifyOwnerSession(current.replace('owner-v1.2.','owner-v1.3.'),3),false);
 const account={auth_version:2,credential_salt:salt,credential_hash:credential};assert.equal(await ownerPasswordMatches(password,account),true);assert.equal(await ownerPasswordMatches(process.env.ADMIN_PASSWORD,account),false);delete process.env.ADMIN_PASSWORD;delete process.env.ADMIN_SESSION_SECRET;
 for(const role of ['anon','authenticated']){await db.exec('set role '+role);await assert.rejects(()=>db.query('select * from store_owner_credentials'),/permission denied/);await assert.rejects(()=>db.query('select * from store_owner_resets'),/permission denied/);await assert.rejects(()=>db.query('select replace_store_owner_password(2,$1,$2,null)',[salt,credential]),/permission denied/);await db.exec('reset role');}
});
test('Recovery sends solely to the configured owner, hides the secret from URL requests, and refuses unconfirmed email sends',async()=>{
 process.env.OWNER_RECOVERY_EMAIL_KEY='isolated-mail-key';process.env.OWNER_RECOVERY_EMAIL_FROM='Daily Basket <onboarding@resend.dev>';process.env.STORE_PUBLIC_URL='https://store.invalid';
 const token='ef'.repeat(32);await sendOwnerRecovery(token,async(url,init)=>{assert.equal(url,'https://api.resend.com/emails');assert.equal(init?.redirect,'manual');const body=JSON.parse(init?.body as string);assert.deepEqual(body.to,[OWNER_RECOVERY_EMAIL]);const link=new URL(body.text.match(/https:\/\/\S+/)[0]);assert.equal(link.origin,'https://store.invalid');assert.equal(link.search,'');assert.equal(link.hash,'#token='+token);return Response.json({id:'isolated-message-id'});});
 await assert.rejects(()=>sendOwnerRecovery(token,async()=>new Response('',{status:302})),/could not send/);await assert.rejects(()=>sendOwnerRecovery(token,async()=>Response.json({})),/not confirmed/);
 delete process.env.OWNER_RECOVERY_EMAIL_KEY;delete process.env.OWNER_RECOVERY_EMAIL_FROM;delete process.env.STORE_PUBLIC_URL;
});
test('Recovery HTTP entry rejects other email addresses and phone inputs and never pretends email is sent while disconnected',async t=>{
 const send=globalThis.fetch,env={...process.env};process.env.SUPABASE_URL='https://isolated-database.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='test-only';delete process.env.APP_ORIGIN;delete process.env.OWNER_RECOVERY_EMAIL_KEY;
 t.after(()=>{globalThis.fetch=send;for(const k of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','APP_ORIGIN','OWNER_RECOVERY_EMAIL_KEY']){if(env[k]===undefined)delete process.env[k];else process.env[k]=env[k];}});
 globalThis.fetch=async input=>{assert.match(String(input),/consume_rate_limit$/);return Response.json(true);};
 const post=(body:unknown)=>recovery(new Request('https://store.invalid/api/admin/recovery',{method:'POST',headers:{Origin:'https://store.invalid'},body:JSON.stringify(body)}));
 assert.equal((await post({action:'request',email:'someone-else@example.com'})).status,400);assert.equal((await post({action:'request',phone:'03084555567'})).status,400);assert.equal((await post({action:'request',email:OWNER_RECOVERY_EMAIL})).status,503);
});
