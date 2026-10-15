import Storefront from '@/components/Storefront';
import {loadShopCatalog} from '@/lib/shop-data';
export const metadata={title:'All groceries | Askari Departmental Store'};
export default async function ShopPage({searchParams}:{searchParams:Promise<{q?:string|string[]}>}){const p=await searchParams;const search=(typeof p.q==='string'?p.q:'').slice(0,100);return <Storefront key={search} initialCatalog={await loadShopCatalog({search})} mode="shop" search={search}/>;}
