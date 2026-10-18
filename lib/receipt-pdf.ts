import {PDFDocument,rgb,type PDFFont,type PDFPage} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {receiptSummary} from './receipt';
import {money} from './constants';
import type {Order} from './types';

// Both the order desk and Discord use this renderer. Only saved order snapshots are read.
type Assets={font:(name:string)=>Promise<Uint8Array>;photo?:(url:string)=>Promise<Uint8Array|null>};
export async function receiptPhoto(url:string,send:typeof fetch=fetch,timeout=5000):Promise<Uint8Array|null>{
 try{const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.port||!['cdn.shopify.com','www.naheed.pk','naheed.pk'].includes(u.hostname))return null;if(u.hostname==='cdn.shopify.com'){u.searchParams.set('width','180');u.searchParams.set('format','jpg');}
  const response=await send(u,{redirect:'manual',signal:AbortSignal.timeout(Math.max(1,timeout))});if(!response.ok||!response.body)return null;const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2_000_000){await reader.cancel();return null;}chunks.push(value);}const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}return bytes;
 }catch{return null;}
}
export async function createPackingPdf(order:Order,assets:Assets):Promise<Uint8Array>{
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
 const [regular,bold,arabic]=await Promise.all(['noto-sans.ttf','noto-sans-bold.ttf','noto-sans-arabic.ttf'].map(async name=>pdf.embedFont(await assets.font(name),{subset:true})));
 const r=receiptSummary(order);const width=420,height=595,edge=22;let page!:PDFPage;let y=0;
 const choose=(text:string,heavy=false)=>/^[\u0600-\u08ff\s]+$/.test(text)?arabic:heavy?bold:regular;
 const runs=(value:string,heavy=false)=>(value.match(/[\u0600-\u08ff][\u0600-\u08ff\s]*|[^\u0600-\u08ff]+/gu)||[]).map(value=>({value,font:choose(value,heavy)}));
 const measure=(value:string,size:number,heavy=false)=>runs(value,heavy).reduce((sum,r)=>sum+r.font.widthOfTextAtSize(r.value,size),0);
 const clean=(text:string)=>text.replace(/[\r\n\t]/g,' ').replace(/[\u0000-\u001f]/g,'');
 const wrap=(text:string,max:number,size:number,font:PDFFont)=>{const lines:string[]=[];let line='';for(const word of clean(text).split(/\s+/)){if(line&&measure(line+' '+word,size,font===bold)>max){lines.push(line);line='';}for(const char of (line?' ':'')+word){if(line&&measure(line+char,size,font===bold)>max){lines.push(line);line='';}line+=char;}}if(line)lines.push(line);return lines;};
 const text=(value:string,x:number,top:number,size=10,heavy=false,right=false)=>{const s=clean(value);let cursor=right?x-measure(s,size,heavy):x;for(const run of runs(s,heavy)){page.drawText(run.value,{x:cursor,y:height-top-size,size,font:run.font,color:rgb(.05,.06,.06)});cursor+=run.font.widthOfTextAtSize(run.value,size);}};
 const rule=(top:number,heavy=false)=>page.drawLine({start:{x:edge,y:height-top},end:{x:width-edge,y:height-top},color:heavy?rgb(.05,.06,.06):rgb(.83,.86,.85),thickness:heavy?1:.5});
 const newPage=()=>{page=pdf.addPage([width,height]);text('DAILY BASKET',edge,20,19,true);text('PACKING RECEIPT',width-edge,23,11,true,true);text('Groceries · Lahore',edge,46,9);text(r.reference,edge,64,8);text(r.placed,width-edge,64,8,false,true);rule(83,true);y=96;};
 const ensure=(space:number)=>{if(y+space>height-35)newPage();};
 newPage();if(order.id.startsWith('SAMPLE')){text('SAMPLE ORDER · PRACTICE ONLY',edge,y,9,true);y+=21;}
 for(const [value,size,heavy] of [[order.customer_name,12,true],[order.customer_phone,10,false],[order.delivery_area+' — '+order.delivery_address,9,false]] as const){if(!value)continue;for(const line of wrap(value,width-2*edge,size,choose(value,heavy))){ensure(18);text(line,edge,y,size,heavy);y+=size+5;}}
 y+=9;ensure(20);rule(y);text(`${r.items.length} product lines · ${r.units} units`,edge,y+7,8);y+=27;
 // Bound the whole photo phase as well as each download for background Worker execution.
 const photoDeadline=Date.now()+12000;
 for(let start=0;start<r.items.length;start+=4){const chunk=r.items.slice(start,start+4);const remaining=photoDeadline-Date.now();const photos=await Promise.all(chunk.map(i=>remaining<=0?Promise.resolve(null):assets.photo?assets.photo(i.image_url):receiptPhoto(i.image_url,fetch,Math.min(5000,remaining))));
  for(let n=0;n<chunk.length;n++){const item=chunk[n],names=wrap(item.name,235,10,choose(item.name,true)),units=wrap(item.unit,235,8,choose(item.unit));const rowHeight=Math.max(58,names.length*14+units.length*12+25);ensure(rowHeight+8);
   let image;try{const bytes=photos[n];if(bytes)image=bytes[0]===0x89?await pdf.embedPng(bytes):await pdf.embedJpg(bytes);}catch{}
   if(image){const fit=image.scaleToFit(35,48);page.drawImage(image,{x:edge+(35-fit.width)/2,y:height-y-8-fit.height,width:fit.width,height:fit.height});}else{text('No photo',edge,y+16,6);}
   names.forEach((line,i)=>text(line,70,y+3+i*14,10,true));let detailY=y+6+names.length*14;units.forEach((line,i)=>text(line,70,detailY+i*12,8));detailY+=units.length*12;text(`${item.quantity} × ${money(item.price)}`,70,detailY+3,9);
   text(money(item.lineTotal),width-edge,y+4,10,true,true);page.drawRectangle({x:width-edge-9,y:height-y-36,width:9,height:9,borderColor:rgb(.6,.63,.62),borderWidth:.5});y+=rowHeight;rule(y);y+=8;
  }
 }
 ensure(150);y+=6;for(const [label,value,heavy] of [['Products',r.subtotal,false],['Delivery',r.delivery,false],['Order total (COD)',r.total,true]] as const){text(label,205,y,heavy?11:10,heavy);text(money(value),width-edge,y,heavy?12:10,heavy,true);y+=heavy?28:22;}rule(y,true);y+=16;text('Packed by: __________________',edge,y,9);text('Dispatch time: ______________',225,y,9);y+=30;for(const line of wrap('Packing copy · Not proof of payment. Cash handover and payment confirmation are managed by the store owner.',width-2*edge,8,regular)){text(line,edge,y,8);y+=12;}
 const pages=pdf.getPages();pages.forEach((p,i)=>p.drawText(`${i+1} / ${pages.length}`,{x:width-48,y:15,size:7,font:regular,color:rgb(.35,.4,.38)}));pdf.setTitle('Daily Basket packing receipt '+order.id);pdf.setSubject('Packing copy — not proof of payment');return pdf.save();
}
export async function downloadPackingPdf(order:Order){const bytes=await createPackingPdf(order,{font:async name=>{const r=await fetch('/fonts/'+name);if(!r.ok)throw Error('Receipt font unavailable');return new Uint8Array(await r.arrayBuffer());}});const blob=new Blob([bytes as BlobPart],{type:'application/pdf'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Daily Basket-'+order.id+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
