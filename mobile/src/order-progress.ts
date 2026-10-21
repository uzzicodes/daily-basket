export function customerOrderProgress(status:string,language:'en'|'ur'='en'){
 const steps=language==='ur'?['آرڈر کی تصدیق ہو گئی','آرڈر روانہ ہو گیا','آرڈر ڈیلیور ہو گیا']:['Order confirmed','Order dispatched','Order delivered'];
 const cancelled=status==='Cancelled',stage=cancelled?-1:status==='Delivered'?2:['Out for Delivery','Dispatched'].includes(status)?1:0;
 return {steps,stage,cancelled,label:cancelled?(language==='ur'?'آرڈر منسوخ ہو گیا':'Order cancelled'):steps[stage]};
}
export async function refreshActiveReceipts(orders:readonly {id:string;status:string}[],refresh:(id:string)=>Promise<unknown>){
 return Promise.allSettled(orders.filter(o=>!['Delivered','Cancelled'].includes(o.status)).slice(0,20).map(o=>refresh(o.id)));
}
