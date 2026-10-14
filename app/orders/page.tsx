import type { Metadata } from 'next';
import OrderDesk from '@/components/OrderDesk';
import { SEED_PRODUCTS } from '@/lib/products';
import type { Order } from '@/lib/types';
export const metadata:Metadata={title:'Order Desk | Askari Departmental Store',robots:{index:false,follow:false},manifest:'/desk.webmanifest',appleWebApp:{capable:true,title:'Askari Orders',statusBarStyle:'default'},icons:{apple:'/desk-icon-192.png'}};
export default function OrdersPage(){
  const items=[SEED_PRODUCTS[0],SEED_PRODUCTS[1],SEED_PRODUCTS[5]].map((p,index)=>({product_id:p.id,name:p.name.toLowerCase().includes(p.brand.toLowerCase())?p.name:`${p.brand} ${p.name}`,unit:p.unit,image_url:p.image_url,quantity:index===0?1:2,price:p.price!}));
  const subtotal=items.reduce((sum,i)=>sum+i.quantity*i.price,0);
  const samples:Order[]=['Pending','Packing','Out for Delivery'].map((status,index)=>({id:`SAMPLE-${index+1}`,customer_name:['Sample customer A','Sample customer B','Sample customer C'][index],customer_phone:'',delivery_area:['DHA Phase 5','Askari 11','Gulberg'][index],delivery_address:'Sample delivery address — for layout preview only',items,subtotal,delivery_fee:0,total_amount:subtotal,payment_method:'Cash on Delivery',status:status as Order['status'],created_at:`2026-10-14T0${7-index}:00:00+05:00`}));
  return <OrderDesk samples={samples}/>;
}
