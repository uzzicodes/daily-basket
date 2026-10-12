import Storefront from '@/components/Storefront';
import { SEED_PRODUCTS } from '@/lib/products';
import { database, databaseConfigured } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { STORE_WHATSAPP_DEFAULT } from '@/lib/constants';
import { fallbackCatalog, type CatalogPage } from '@/lib/catalog';
export const dynamic = 'force-dynamic';
export default async function Home() {
  let catalog:CatalogPage=fallbackCatalog(SEED_PRODUCTS);let catalogPreview=process.env.CATALOG_PREVIEW==='true'||!databaseConfigured();
  if(databaseConfigured()){const {data,error}=await database().rpc('browse_catalog',{});if(error){console.error('Catalog database query failed',error.code);catalogPreview=true;}else if(data)catalog=data as CatalogPage;}
  const number=process.env.STORE_WHATSAPP_NUMBER || STORE_WHATSAPP_DEFAULT;
  return <Storefront initialCatalog={catalog} configured={databaseConfigured()} catalogPreview={catalogPreview} whatsappNumber={/^\d{10,15}$/.test(number)?number:''}/>;
}
