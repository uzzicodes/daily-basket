import { z } from 'zod';
export type InventoryItem={id:string;catalog_code:string;name:string;brand:string;unit:string;barcode:string|null;sku:string|null;source_name:string|null;price:number|null;in_stock:boolean};
export type PriceRow={row:number;product_id?:string;code?:string;barcode?:string;name:string;brand:string;unit:string;price:number|null;error?:string};
export type Match={row:PriceRow;product:InventoryItem|null;candidates:InventoryItem[];issue?:string};
const normal=(v:string)=>v.normalize('NFKC').toLowerCase().replace(/[’']/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const aliases:Record<string,string>={productid:'product_id',catalogid:'product_id',id:'product_id',catalogcode:'code',productcode:'code',itemcode:'code',sku:'code',barcode:'barcode',ean:'barcode',upc:'barcode',name:'name',productname:'name',itemname:'name',item:'name',description:'name',product:'name',brand:'brand',unit:'unit',size:'unit',packsize:'unit',packing:'unit',price:'price',saleprice:'price',sellingprice:'price',retailprice:'price',rate:'price',mrp:'price'};
export function parsePrice(value:unknown):{price:number|null;error?:string}{
 if(value===null||value===undefined||String(value).trim()==='')return {price:null};
 const text=String(value).trim().replace(/^(?:PKR|Rs\.?)\s*/i,'').replace(/,/g,'');
 if(!/^\d+(?:\.\d{1,2})?$/.test(text))return {price:null,error:'Enter a positive PKR price with at most two decimals.'};
 const price=Number(text);return price>0&&price<=9999999999.99?{price}:{price:null,error:'Price must be greater than zero.'};
}
export function priceRows(matrix:unknown[][]):PriceRow[]{
 const headerIndex=matrix.slice(0,20).findIndex(row=>row.some(cell=>aliases[normal(String(cell??'')).replace(/ /g,'')]==='price'));
 if(headerIndex<0)throw Error('Add a Price, Sale Price, Rate or MRP column.');
 const columns=matrix[headerIndex].map(cell=>aliases[normal(String(cell??'')).replace(/ /g,'')]);
 if(!columns.some(c=>['product_id','code','barcode','name'].includes(c)))throw Error('Add a Product ID, Catalog Code, Barcode or Product Name column.');
 if(columns.filter(c=>c==='price').length!==1)throw Error('Choose one price column; remove competing price columns.');
 const rows:PriceRow[]=[];
 for(let i=headerIndex+1;i<matrix.length;i++){
  if(!matrix[i].some(v=>v!==null&&v!==undefined&&String(v).trim()!==''))continue;
  const values:Record<string,unknown>={};columns.forEach((c,j)=>{if(c)values[c]=matrix[i][j];});
  const text=(key:string)=>String(values[key]??'').trim();const p=parsePrice(values.price);
  rows.push({row:i+1,product_id:text('product_id')||undefined,code:text('code')||undefined,barcode:text('barcode')||undefined,name:text('name'),brand:text('brand'),unit:text('unit'),...p});
 }
 if(!rows.length||rows.length>25000)throw Error('Use a non-empty sheet with at most 25,000 product rows.');return rows;
}
export function matchPrices(rows:PriceRow[],catalog:InventoryItem[]):Match[]{
 const byId=new Map(catalog.map(p=>[p.id,p]));const indices=new Map<string,InventoryItem[]>();
 const put=(key:string,p:InventoryItem)=>{const arr=indices.get(key)??[];if(!arr.some(x=>x.id===p.id))arr.push(p);indices.set(key,arr);};
 for(const p of catalog){for(const c of [p.catalog_code,p.sku])if(c)put('code:'+normal(c),p);if(p.barcode)put('barcode:'+p.barcode.replace(/\s/g,''),p);for(const n of [p.name,p.source_name])if(n){put('name:'+normal(n),p);put('name:'+normal([p.brand,n,p.unit].join(' ')),p);}}
 const used=new Set<string>();
 return rows.map(row=>{let candidates:InventoryItem[]=[];
  if(row.product_id)candidates=byId.has(row.product_id)?[byId.get(row.product_id)!]:[];
  else if(row.code)candidates=indices.get('code:'+normal(row.code))??[];
  else if(row.barcode)candidates=indices.get('barcode:'+row.barcode.replace(/\s/g,''))??[];
  else if(row.name){candidates=indices.get('name:'+normal(row.name))??indices.get('name:'+normal([row.brand,row.name,row.unit].join(' ')))??[];if(row.brand)candidates=candidates.filter(p=>normal(p.brand)===normal(row.brand));if(row.unit)candidates=candidates.filter(p=>normal(p.unit)===normal(row.unit));}
  const product=candidates.length===1?candidates[0]:null;let issue=row.error??(!product?(candidates.length?'More than one size or variant matches. Use its catalog code.':'No exact match. Enter a catalog code from the template.'):undefined);
  if(product&&used.has(product.id))issue='Duplicate product row. Remove the duplicate before importing.';if(product)used.add(product.id);
  return {row,product,candidates,issue};
 });
}
export const inventoryImportSchema=z.object({rows:z.array(z.object({product_id:z.string().uuid(),price:z.number().finite().positive().max(9999999999.99).refine(v=>Math.abs(v*100-Math.round(v*100))<0.0001).nullable()}).strict()).min(1).max(25000),idempotency_key:z.string().uuid(),file_name:z.string().min(1).max(150),revision:z.number().int().nonnegative()}).strict();
export function parseCSV(text:string):unknown[][]{
 const delimiter=text.split(/\r?\n/,1)[0].includes(';')?';':',';const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(!quoted&&c===delimiter){row.push(cell);cell='';}else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('The CSV has an unclosed quoted cell.');if(cell||row.length){row.push(cell);rows.push(row);}return rows;
}
