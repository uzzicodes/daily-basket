'use client';
import { ShoppingBag, MapPin, Search, ChevronDown, ArrowUpRight, ListChecks, Clock3, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './CartProvider';
import StoreLogo from './StoreLogo';
import { money } from '@/lib/constants';
import { withinDeliveryRange } from '@/lib/delivery';
import type { Product } from '@/lib/types';
import { QuantityControl } from './ProductCard';
import Link from 'next/link';
import {productPath} from '@/lib/shop-routes';
export default function Navbar({products,search,setSearch,loading=false,onSearch}: {loading?:boolean;products:Product[];search:string;setSearch:(v:string)=>void;onSearch:()=>void}) {
  const {deliveryPoint,setCoverageOpen,quantities,products:cartProducts,setCartOpen,setPaperOpen}=useCart();
  const [focused,setFocused]=useState(false);
  const count=Object.values(quantities).reduce((s,v)=>s+v,0);
  const total=cartProducts.reduce((s,p)=>s+(p.price??0)*(quantities[p.id]||0),0);
  const matches=search.trim()?products.filter(p=>`${p.name} ${p.brand} ${p.unit}`.toLowerCase().includes(search.trim().toLowerCase())).slice(0,5):[];
  return <><div className="announcement"><Clock3 size={13}/><span><strong>Delivery within 5 km of our store</strong><span className="announcement-extra"> · FREE delivery on Rs. 2,999 or more</span></span><span className="announcement-location">Your neighbourhood, delivered.</span></div><header className="navbar"><div className="container nav-main"><StoreLogo/><button className="delivery-location coverage-trigger" onClick={()=>setCoverageOpen(true)} aria-label="Check our 5 km delivery area"><MapPin size={19}/><span><small>DELIVERY WITHIN 5 KM</small><strong className={deliveryPoint&&!withinDeliveryRange(deliveryPoint)?"coverage-outside":""}>{deliveryPoint?(withinDeliveryRange(deliveryPoint)?"Your pin is in range":"Outside delivery area"):"Check your location"}</strong></span><ChevronDown size={14}/></button><div className="search-wrap"><Search size={19}/><input aria-label="Search groceries" placeholder="Search for milk, atta, your everyday essentials…" value={search} onChange={e=>setSearch(e.target.value)} onFocus={()=>setFocused(true)} onBlur={e=>{if(!e.currentTarget.parentElement?.contains(e.relatedTarget))setFocused(false);}} onKeyDown={e=>{if(e.key==='Escape')setFocused(false);if(e.key==='Enter'){setFocused(false);onSearch();}}}/>{search && <button className="icon-button" aria-label="Clear search" onClick={()=>setSearch('')}><X size={15}/></button>}{focused && search.trim() && <div className="search-results"><p className="search-preview-title">Matching products</p>{loading?<p className="empty-search">Searching the catalog…</p>:matches.length?matches.map(p=><div className="search-result" key={p.id}><img src={p.image_url} width="44" height="44" alt={p.name}/><div><Link href={productPath(p)} prefetch={false} onClick={()=>setFocused(false)}><strong>{p.name}</strong></Link><span>{p.brand} · {p.unit}</span><b>{money(p.price)}</b></div><QuantityControl product={p} compact/></div>):<p className="empty-search">No groceries found. Try another brand or product.</p>}<button className="search-all" onClick={()=>{setFocused(false);onSearch();}}>View matching groceries <ArrowUpRight size={15}/></button></div>}</div><button className="paper-nav" aria-label="Send a grocery list" onClick={()=>setPaperOpen(true)}><ListChecks size={18}/><span>Send a grocery list</span></button><button className="basket-trigger" onClick={()=>setCartOpen(true)} aria-label={`Open basket, ${count} items, ${money(total)}`}><span className="basket-icon"><ShoppingBag size={20}/><b key={count}>{count}</b></span><span>Your basket<strong>{money(total)}</strong></span></button></div></header></>;
}
