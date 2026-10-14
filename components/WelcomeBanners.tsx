'use client';
import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ListChecks, MapPin } from 'lucide-react';
import { useCart } from './CartProvider';
import { SEED_PRODUCTS } from '@/lib/products';
const slides=[
  {title:'Your everyday essentials. Closer to home.',text:'Pantry favourites, household care and the little things on your list. All at Askari.',action:'Explore groceries',products:[0,1,2]},
  {title:'The brands you know. In one good store.',text:'Find the right pack, size and variant for your home. Browse our grocery departments.',action:'Browse the shelves',products:[3,5,6]},
  {title:'A full basket. A shorter trip.',text:'Shop online and pay when your groceries arrive. We deliver within 5 km of our store.',action:'Check delivery area',products:[8,10,0]},
];
export default function WelcomeBanners(){
  const [slide,setSlide]=useState(0);const {setPaperOpen,setCoverageOpen}=useCart();const current=slides[slide];
  const shop=()=>document.getElementById('shop')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  return <section className="welcome-banners" aria-label="Welcome to Askari"><div className="welcome-main" aria-roledescription="carousel" aria-label="Store highlights"><div className="welcome-copy" aria-live="polite"><h1>{current.title}</h1><p>{current.text}</p><button className="primary" onClick={slide===2?()=>setCoverageOpen(true):shop}>{current.action}<ArrowRight size={17}/></button><span className="welcome-delivery"><MapPin size={15}/>PGECHS Phase 1 · 5 km delivery radius</span></div><div className="welcome-products" aria-hidden="true">{current.products.map((index,i)=><div className={`welcome-product product-${i}`} key={`${slide}-${index}`}><img src={SEED_PRODUCTS[index].image_url} alt="" loading={slide===0?'eager':'lazy'}/></div>)}</div><div className="welcome-controls"><button aria-label="Previous banner" onClick={()=>setSlide(s=>(s+slides.length-1)%slides.length)}><ChevronLeft size={18}/></button><div>{slides.map((_,i)=><button key={i} aria-label={`Show banner ${i+1}`} aria-pressed={slide===i} onClick={()=>setSlide(i)}/>)}</div><button aria-label="Next banner" onClick={()=>setSlide(s=>(s+1)%slides.length)}><ChevronRight size={18}/></button></div></div>
    <aside className="welcome-list"><ListChecks size={28} strokeWidth={1.5}/><h2>Got a grocery list?<br/>Leave the picking to us.</h2><p>Type it out or send a photo on WhatsApp. Familiar shopping, a little easier.</p><button onClick={()=>setPaperOpen(true)}>Send your list<ArrowRight size={18}/></button><span>Cash on Delivery · Nearby delivery</span></aside>
  </section>;
}
