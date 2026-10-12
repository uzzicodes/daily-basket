import fs from 'node:fs';
const input=fs.readFileSync('lib/products.ts','utf8');
const products=JSON.parse(input.slice(input.indexOf('= ')+2).trim().replace(/;$/,''));
const quote=v=>"'"+String(v).replaceAll("'","''")+"'";
const columns=['id','name','brand','category','price','original_price','unit','image_url','rating','in_stock'];
const values=products.map(p=>'('+columns.map(c=>typeof p[c]==='number'||typeof p[c]==='boolean'?p[c]:quote(p[c])).join(',')+')').join(',\n');
fs.writeFileSync('supabase/migrations/002_seed.sql','-- Demonstration inventory. Review prices, ratings and stock before launch.\ninsert into public.products('+columns.join(',')+') values\n'+values+'\non conflict(id) do nothing;\n');
