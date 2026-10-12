'use client';
import { LayoutGrid, Wheat, Milk, Coffee, CookingPot, Cookie, WashingMachine, SprayCan, Baby, Heart } from 'lucide-react';
import { CATEGORIES, CATEGORY_SHORT } from '@/lib/constants';
export const categoryIcons=[Wheat,Milk,Coffee,CookingPot,Cookie,WashingMachine,SprayCan,Baby,Heart];
export default function CategoryBar({category,setCategory}: {category:string;setCategory:(v:string)=>void}) {
  return <nav className="category-nav" aria-label="Grocery categories"><div className="container category-scroll"><button className={category==='All'?'active':''} onClick={()=>setCategory('All')}><LayoutGrid size={17}/>All groceries</button>{CATEGORIES.map((c,i)=>{const Icon=categoryIcons[i];return <button key={c} className={category===c?'active':''} onClick={()=>{setCategory(c);document.getElementById('shop')?.scrollIntoView({behavior:'smooth'});}}><Icon size={16}/>{CATEGORY_SHORT[i]}</button>;})}</div></nav>;
}
