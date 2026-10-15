'use client';
import { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ListChecks, MapPin } from 'lucide-react';
import { useCart } from './CartProvider';
import Link from 'next/link';
const slides=[
  {title:'Everyday essentials. One familiar store.',text:'From the kitchen cupboard to the laundry basket. Find what your home needs at Askari.',action:'Explore groceries',href:'/categories',image:'everyday',alt:'A basket of groceries with pantry staples on a sunlit kitchen counter'},
  {title:'Good mornings start here.',text:'Milk, breakfast favourites and something for your daily cup. Find your favourite pack.',action:'Shop breakfast',href:'/category/dairy-breakfast',image:'breakfast',alt:'Tea, toast, cereal and milk arranged on a breakfast table'},
  {title:'A little care for every corner.',text:'Laundry, cleaning and everyday home essentials. Keep your cupboard ready for the week.',action:'Explore home care',href:'/category/household',image:'home-care',alt:'Home cleaning supplies with neatly folded towels in a bright laundry room'},
];
export default function WelcomeBanners(){
  const [slide,setSlide]=useState(0);const {setPaperOpen,setCoverageOpen}=useCart();const current=slides[slide];
  return <section className="welcome-banners" aria-label="Welcome to Askari"><div className="welcome-main" aria-roledescription="carousel" aria-label="Store highlights"><img key={current.image} className="welcome-art" src={`/images/banners/${current.image}.webp`} width={2172} height={724} alt={current.alt} fetchPriority={slide===0?'high':'auto'}/><div className="welcome-copy" aria-live="polite" aria-atomic="true"><h1>{current.title}</h1><p>{current.text}</p><Link className="primary" href={current.href}>{current.action}<ArrowRight size={17}/></Link><button className="welcome-delivery" onClick={()=>setCoverageOpen(true)}><MapPin size={15}/>PGECHS Phase 1 · 5 km delivery radius</button></div><div className="welcome-controls"><button aria-label="Previous banner" onClick={()=>setSlide(s=>(s+slides.length-1)%slides.length)}><ChevronLeft size={18}/></button><div>{slides.map((_,i)=><button key={i} aria-label={`Show banner ${i+1}`} aria-pressed={slide===i} onClick={()=>setSlide(i)}/>)}</div><button aria-label="Next banner" onClick={()=>setSlide(s=>(s+1)%slides.length)}><ChevronRight size={18}/></button></div></div>
    <aside className="welcome-list"><ListChecks size={28} strokeWidth={1.5}/><h2>Got a grocery list? Leave the picking to us.</h2><p>Type it out or send a photo on WhatsApp. Familiar shopping, a little easier.</p><button onClick={()=>setPaperOpen(true)}>Send your list<ArrowRight size={18}/></button><span>Cash on Delivery · Nearby delivery</span></aside>
  </section>;
}
