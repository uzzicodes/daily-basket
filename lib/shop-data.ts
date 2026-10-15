import {cache} from 'react';
import {database,databaseConfigured} from './supabase';
import {fallbackCatalog,type CatalogPage} from './catalog';
import {SEED_PRODUCTS} from './products';
import type {Product} from './types';
export async function loadShopCatalog({category='All',search='',available=false}:{category?:string;search?:string;available?:boolean}={}){
 if(!databaseConfigured()){const fallback=fallbackCatalog(SEED_PRODUCTS);return available?{...fallback,products:[],total:0,next_offset:null}:fallback;}
 const {data,error}=await database().rpc('browse_catalog',{p_category:category,p_search:search.slice(0,100),p_available:available});
 if(error)throw Error('The grocery catalog is temporarily unavailable. Please retry.');
 return data as CatalogPage;
}
export const loadShopProduct=cache(async(id:string):Promise<Product|null>=>{
 if(!databaseConfigured())return null;
 const {data,error}=await database().rpc('browse_catalog',{p_ids:[id]});
 if(error)throw Error('This product could not be loaded. Please retry.');
 return (data as CatalogPage).products[0]??null;
});
