'use client';
import { createContext,useCallback,useContext,useEffect,useState,type ReactNode } from 'react';
import type { Product } from '@/lib/types';
type CartState={quantities:Record<string,number>;products:Product[];registerProducts:(p:Product[])=>void;notice:string;change:(id:string,delta:number)=>void;remove:(id:string)=>void;clear:()=>void;area:string;setArea:(v:string)=>void;cartOpen:boolean;setCartOpen:(v:boolean)=>void;paperOpen:boolean;setPaperOpen:(v:boolean)=>void};
const Context=createContext<CartState|null>(null);
export function CartProvider({children,initialProducts}:{children:ReactNode;initialProducts:Product[]}){
 const [quantities,setQuantities]=useState<Record<string,number>>({});const [products,setProducts]=useState(initialProducts);const [ready,setReady]=useState(false);const [notice,setNotice]=useState('');const [area,setArea]=useState('DHA Phase 5');const [cartOpen,setCartOpen]=useState(false);const [paperOpen,setPaperOpen]=useState(false);
 const registerProducts=useCallback((rows:Product[])=>setProducts(prev=>{const map=new Map(prev.map(p=>[p.id,p]));rows.forEach(p=>map.set(p.id,p));return [...map.values()];}),[]);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('barakah-basket')??'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))setQuantities(Object.fromEntries(Object.entries(saved).filter(([k,v])=>/^[\da-f-]{36}$/i.test(k)&&Number.isInteger(v)&&Number(v)>0&&Number(v)<=99)) as Record<string,number>);const a=localStorage.getItem('barakah-area');if(a)setArea(a);}catch{}setReady(true);},[]);
 useEffect(()=>{registerProducts(initialProducts);},[initialProducts,registerProducts]);
 useEffect(()=>{if(!ready)return;let active=true;const ids=Object.keys(quantities);if(!ids.length)return;fetch('/api/catalog?ids='+ids.slice(0,60).join(',')).then(r=>{if(!r.ok)throw Error();return r.json() as Promise<{products:Product[]}>;}).then((d:{products:Product[]})=>{if(!active)return;registerProducts(d.products);const allowed=new Set(d.products.filter(p=>p.in_stock&&p.price!==null&&p.price>0).map(p=>p.id));setQuantities(prev=>{const next=Object.fromEntries(Object.entries(prev).filter(([id])=>!ids.includes(id)||allowed.has(id)));if(Object.keys(next).length<Object.keys(prev).length)setNotice('Unavailable items were removed from your basket.');return next;});}).catch(()=>{});return()=>{active=false;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[ready,initialProducts,registerProducts]);
 useEffect(()=>{if(ready)try{localStorage.setItem('barakah-basket',JSON.stringify(quantities));localStorage.setItem('barakah-area',area);}catch{}},[quantities,area,ready]);
 const change=(id:string,delta:number)=>{const p=products.find(p=>p.id===id);if(delta>0&&(!p?.in_stock||p.price===null||p.price<=0))return;setQuantities(prev=>{const n={...prev};const q=Math.min(99,Math.max(0,(n[id]??0)+delta));if(q)n[id]=q;else delete n[id];return n;});};
 const remove=(id:string)=>setQuantities(prev=>{const n={...prev};delete n[id];return n;});
 return <Context.Provider value={{quantities,products,registerProducts,notice,change,remove,clear:()=>setQuantities({}),area,setArea,cartOpen,setCartOpen,paperOpen,setPaperOpen}}>{children}</Context.Provider>;
}
export function useCart(){const c=useContext(Context);if(!c)throw Error('CartProvider is required');return c;}
