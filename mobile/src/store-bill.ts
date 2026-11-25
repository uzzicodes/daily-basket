// The customer's printed bill for the store's receipt printer: our header, each product's name,
// quantity and price, then the total. Plain HTML with no app dependencies, so the phone app (Android
// print) and the counter computer (browser print) print exactly the same bill.
export type BillPaper='80'|'58';
export type BillOrder={id:string;created_at:string;customer_name:string;customer_phone?:string;delivery_area?:string;items:{name:string;unit?:string;quantity:number;price:number}[];subtotal:number;delivery_fee:number;total_amount:number};
export const BILL_STORE={name:'DAILY BASKET',line:'Groceries · PGECHS Phase 1, Lahore',phone:'0308 4555567'};
const escape=(value:unknown)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const rupees=(value:number)=>'Rs. '+new Intl.NumberFormat('en-PK',{maximumFractionDigits:2}).format(value);
export const billNumber=(id:string)=>id.replace(/^ORD-/i,'').replace(/-/g,'').slice(-8).toUpperCase();
const when=(value:string)=>{const d=new Date(value);return isNaN(d.getTime())?'':d.toLocaleString('en-PK',{timeZone:'Asia/Karachi',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});};

export function storeBillHtml(order:BillOrder,paper:BillPaper='80'){
 const width=paper==='58'?48:72,small=paper==='58',units=order.items.reduce((n,i)=>n+i.quantity,0);
 const row=(label:string,value:string,cls='')=>`<div class="row ${cls}"><span>${label}</span><span>${value}</span></div>`;
 const items=order.items.map(i=>`<div class="item"><div class="name">${escape(i.name)}${i.unit?` <small>${escape(i.unit)}</small>`:''}</div>${row(`${i.quantity} × ${escape(rupees(i.price))}`,escape(rupees(i.quantity*i.price)))}</div>`).join('');
 return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Bill ${escape(billNumber(order.id))}</title><style>
@page{size:${paper}mm auto;margin:0}
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#000}
body{width:${width}mm;margin:0 auto;padding:3mm 0 6mm;font:${small?11:12.5}px/1.35 'Courier New',Courier,monospace;-webkit-print-color-adjust:exact}
.c{text-align:center}.store{font:900 ${small?18:22}px/1.1 Arial,Helvetica,sans-serif;letter-spacing:1px}
.sub{font-size:${small?10:11}px;margin-top:2px}hr{border:0;border-top:1px dashed #000;margin:6px 0}hr.solid{border-top:2px solid #000}
.row{display:flex;justify-content:space-between;gap:6px}.row span:last-child{white-space:nowrap;text-align:right}
.item{padding:3px 0}.name{font-weight:700;word-break:break-word}.name small{font-weight:400}
.total{font:900 ${small?15:18}px/1.3 Arial,Helvetica,sans-serif;margin:4px 0}
.meta{font-size:${small?10:11}px}.thanks{margin-top:8px;font-size:${small?10:11}px}
@media screen{body{box-shadow:0 0 0 1px #ddd;padding:4mm 3mm 8mm}}
</style></head><body>
<div class="c"><div class="store">${BILL_STORE.name}</div><div class="sub">${escape(BILL_STORE.line)}</div><div class="sub">Tel / WhatsApp ${BILL_STORE.phone}</div></div>
<hr class="solid">
<div class="meta">${row('Bill no.',escape(billNumber(order.id)))}${row('Date',escape(when(order.created_at)))}${row('Customer',escape(order.customer_name))}${order.delivery_area?row('Area',escape(order.delivery_area)):''}</div>
<hr>
<div class="row meta"><span>Item</span><span>Amount</span></div>
<hr>
${items}
<hr>
${row('Items',String(units))}${row('Subtotal',escape(rupees(order.subtotal)))}${row('Delivery',order.delivery_fee?escape(rupees(order.delivery_fee)):'FREE')}
<hr class="solid">
${row('TOTAL',escape(rupees(order.total_amount)),'total')}
${row('Payment','Cash on delivery','meta')}
<hr>
<div class="c thanks">Thank you for shopping with Daily Basket!</div>
</body></html>`;
}
