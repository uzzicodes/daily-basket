'use client';
import { Plus, Minus, Star, Check } from 'lucide-react';
import { useCart } from './CartProvider';
import { money } from '@/lib/constants';
import type { Product } from '@/lib/types';
export function QuantityControl({product,compact=false}: {product:Product;compact?:boolean}) {
  const {quantities,change}=useCart(); const quantity=quantities[product.id] || 0;
  return quantity ? <div className={`quantity ${compact?'compact':''}`}><button aria-label={`Remove one ${product.name}`} onClick={()=>change(product.id,-1)}><Minus size={16}/></button><span aria-live="polite">{quantity}</span><button aria-label={`Add one ${product.name}`} disabled={quantity>=99 || !product.in_stock} onClick={()=>change(product.id,1)}><Plus size={16}/></button></div> : <button className={`add-button ${compact?'compact':''}`} disabled={!product.in_stock} onClick={()=>change(product.id,1)}><Plus size={17}/>{compact?'Add':'Add to Basket'}</button>;
}
export default function ProductCard({product}: {product:Product}) {
  const discount=Math.max(0,Math.round((1-product.price/product.original_price)*100));
  return <article className="product-card"><div className="product-photo">{discount>0 && <span className="discount">{discount}% OFF</span>}<img src={product.image_url} alt={`${product.brand} ${product.name}, ${product.unit}`} loading="lazy" width="280" height="230"/></div><div className="product-body"><p className="brand-label">{product.brand}</p><h3>{product.name}</h3><p className="unit">{product.unit}</p><div className="product-meta"><span><Star size={12} fill="currentColor"/>{product.rating.toFixed(1)}</span><span className={product.in_stock?'stock':'out-stock'}><Check size={11}/>{product.in_stock?'In stock':'Sold out'}</span></div><div className="price"><strong>{money(product.price)}</strong>{product.original_price>product.price && <del>{money(product.original_price)}</del>}</div><QuantityControl product={product}/></div></article>;
}
