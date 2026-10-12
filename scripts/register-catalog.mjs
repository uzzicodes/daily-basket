import fs from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
// Server-only catalog registration. Metadata refreshes preserve existing store prices.
const env={...process.env};try{for(const line of (await fs.readFile('.env.local','utf8')).split(/\r?\n/)){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m&&!env[m[1]])env[m[1]]=m[2].startsWith('"')?JSON.parse(m[2]):m[2];}}catch{}
if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)throw Error('Configure server database credentials before registration.');
const db=createClient(env.SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const rows=JSON.parse(await fs.readFile('data/catalog/catalog.json','utf8'));
const known=new Set();for(let offset=0;;offset+=1000){const {data,error}=await db.from('products').select('id').range(offset,offset+999);if(error)throw error;data.forEach(p=>known.add(p.id));if(data.length<1000)break;}
let inserted=0;for(let offset=0;offset<rows.length;offset+=250){const batch=rows.slice(offset,offset+250).filter(p=>!known.has(p.id)).map(p=>({id:p.id,name:p.name,brand:p.brand,unit:p.unit,category:p.category,image_url:p.image_url,price:null,original_price:null,rating:null,in_stock:false,source_site:p.source_site,source_url:p.source_url,source_id:p.source_id,source_variant_id:p.source_variant_id,source_name:p.source_title,sku:p.sku,barcode:p.barcode,source_aliases:p.source_aliases??[],source_sku_aliases:p.source_sku_aliases??[]}));if(batch.length){const {error}=await db.from('products').insert(batch);if(error)throw error;inserted+=batch.length;}if(offset%2500===0)console.log('Catalog registration:',Math.min(offset+250,rows.length),'/',rows.length);}
// Archive only the original demonstration IDs; retain records for historical orders.
const seedIds=[...(await fs.readFile('supabase/migrations/002_seed.sql','utf8')).matchAll(/'([0-9a-f-]{36})'/g)].map(m=>m[1]);
const archived=await db.from('products').update({is_archived:true,in_stock:false}).in('id',seedIds).is('source_id',null);if(archived.error)throw archived.error;
if(inserted){for(let attempt=0;attempt<3;attempt++){const state=await db.from('inventory_state').select('revision').eq('singleton',true).single();if(state.error)throw state.error;const changed=await db.from('inventory_state').update({revision:state.data.revision+1,updated_at:new Date().toISOString()}).eq('singleton',true).eq('revision',state.data.revision).select('revision');if(changed.error)throw changed.error;if(changed.data.length)break;if(attempt===2)throw Error('Inventory changed repeatedly; reload counter inventory before reviewing a file.');}}
console.log(JSON.stringify({catalog:rows.length,inserted,existingPricesPreserved:true,demoInventoryArchived:true}));
