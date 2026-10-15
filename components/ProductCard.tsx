'use client';
import { useState } from 'react';
import { Plus, Minus, Check, ImageOff } from 'lucide-react';
import { useCart } from './CartProvider';
import { money } from '@/lib/constants';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import {productPath} from '@/lib/shop-routes';
export function QuantityControl({product,compact=false}:{product:Product;compact?:boolean}){
 const {quantities,change}=useCart();const quantity=quantities[product.id]??0;const available=product.in_stock&&product.price!==null&&product.price>0;
 return quantity?<div className={`quantity ${compact?'compact':''}`}><button aria-label={`Remove one ${product.name}`} onClick={()=>change(product.id,-1)}><Minus size={16}/></button><span aria-live="polite"><b key={quantity} className="quantity-value">{quantity}</b></span><button aria-label={`Add one ${product.name}`} disabled={!available||quantity>=99} onClick={()=>change(product.id,1)}><Plus size={16}/></button></div>:<button className={`add-button ${compact?'compact':''}`} disabled={!available} onClick={()=>change(product.id,1)}>{available?<><Plus size={17}/>{compact?'Add':'Add to Basket'}</>:<>Out of stock</>}</button>;
}
export default function ProductCard({product}:{product:Product}){
 const [failed,setFailed]=useState(false);const available=product.in_stock&&product.price!==null&&product.price>0;
 return <article className={`product-card ${available?'':'unavailable'}`}><Link prefetch={false} href={productPath(product)} className="product-photo" aria-label={`View ${product.name}`}>{failed?<div className="photo-missing"><ImageOff size={28}/><span>Photo unavailable</span></div>:<img src={product.image_url} alt={`${product.brand} ${product.name}, ${product.unit}`} loading="lazy" width="280" height="230" onError={()=>setFailed(true)}/>}</Link><div className="product-body"><p className="brand-label">{product.brand}</p><h3><Link prefetch={false} href={productPath(product)}>{product.name}</Link></h3><p className="unit">{product.unit}</p><div className="product-meta"><span className={available?'stock':'out-stock'}>{available&&<Check size={11}/>} {available?'In stock':'Out of stock'}</span></div><div className={`price ${product.price===null?'pending-price':''}`}><strong>{money(product.price)}</strong></div><QuantityControl product={product}/></div></article>;
}
