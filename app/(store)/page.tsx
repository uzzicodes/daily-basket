import Storefront from '@/components/Storefront';
import {loadShopCatalog} from '@/lib/shop-data';
export default async function Home(){return <Storefront initialCatalog={await loadShopCatalog({available:true})} mode="home"/>;}
