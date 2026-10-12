import Storefront from '@/components/Storefront';
import { SEED_PRODUCTS } from '@/lib/products';
import { database, databaseConfigured } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { STORE_WHATSAPP_DEFAULT } from '@/lib/constants';
export const dynamic = 'force-dynamic';
export default async function Home() {
  let products:Product[]=SEED_PRODUCTS;let catalogPreview=process.env.CATALOG_PREVIEW==='true'||!databaseConfigured();
  if(databaseConfigured()){const {data,error}=await database().from('products').select('*').order('created_at');if(error){console.error('Catalog database query failed',error.code);catalogPreview=true;}else if(data)products=data.map((p,i)=>({...p,popularity:100-i}));}
  const number=process.env.STORE_WHATSAPP_NUMBER || STORE_WHATSAPP_DEFAULT;
  return <Storefront products={products} configured={databaseConfigured()} catalogPreview={catalogPreview} whatsappNumber={/^\d{10,15}$/.test(number)?number:''}/>;
}
