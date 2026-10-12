import type { Product } from './types';
export type Facet={name:string;count:number};
export type CatalogPage={products:Product[];total:number;catalog_total:number;available_total:number;categories:Facet[];brands:Facet[];next_offset:number|null;revision:number};
export const CATALOG_PAGE_SIZE=48;
export function fallbackCatalog(products:Product[]):CatalogPage{
 const unavailable=products.map(p=>({...p,price:null,original_price:null,rating:null,in_stock:false}));
 const count=(field:'brand'|'category')=>Object.entries(unavailable.reduce<Record<string,number>>((a,p)=>{a[p[field]]=(a[p[field]]??0)+1;return a;},{})).map(([name,count])=>({name,count}));
 return {products:unavailable,total:unavailable.length,catalog_total:unavailable.length,available_total:0,categories:count('category'),brands:count('brand'),next_offset:null,revision:0};
}
