import {SEED_PRODUCTS} from './products';
import type {OperationalOrder} from './operations';
export function operationSamples():OperationalOrder[]{
 const items=[SEED_PRODUCTS[0],SEED_PRODUCTS[1],SEED_PRODUCTS[5]].map((p,index)=>({product_id:p.id,name:p.name.toLowerCase().includes(p.brand.toLowerCase())?p.name:p.brand+' '+p.name,unit:p.unit,image_url:p.image_url,quantity:index===0?1:2,price:p.price!}));
 const subtotal=items.reduce((n,i)=>n+i.price*i.quantity,0);
 return ['Pending','Packing','Delivered'].map((status,index)=>({id:'SAMPLE-'+(index+1),customer_name:['Practice customer · bill review','Practice customer · packing','Practice customer · cash return'][index],customer_phone:'',delivery_area:'PGECHS Phase 1',delivery_address:'Fictional address for layout preview only',items,subtotal,delivery_fee:150,total_amount:subtotal+150,payment_method:'Cash on Delivery',status:status as OperationalOrder['status'],created_at:'2026-10-21T08:00:00+05:00',operation_version:0,approval_status:index===0?'pending':'approved',approved_at:null,packed_at:null,assigned_rider_id:null,delivered_at:null,cash_confirmed:false,cash_received:null,settled_at:null,rejection_reason:null}));
}
