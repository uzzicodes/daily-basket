import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import Storefront from '@/components/Storefront';
import {departments} from '@/lib/shop-routes';
import {loadShopCatalog} from '@/lib/shop-data';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const d=departments.find(d=>d.slug===slug);return {title:d?d.label+' | Daily Basket':'Department not found'};}
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const d=departments.find(d=>d.slug===slug);if(!d)notFound();return <Storefront key={slug} initialCatalog={await loadShopCatalog({category:d.name})} mode="category" category={d.name}/>;}
