'use client';
import { LayoutGrid, Wheat, Milk, Coffee, CookingPot, Cookie, WashingMachine, SprayCan, Baby, Heart } from 'lucide-react';
import { CATEGORIES, CATEGORY_SHORT } from '@/lib/constants';
import Link from 'next/link';
import {categoryPath} from '@/lib/shop-routes';
export const categoryIcons=[Wheat,Milk,Coffee,CookingPot,Cookie,WashingMachine,SprayCan,Baby,Heart];
export default function CategoryBar({category='All'}: {category?:string}) {
  return <nav className="category-nav" aria-label="Grocery categories"><div className="container category-scroll"><Link prefetch={false} href="/shop" className={category==='All'?'active':''}><LayoutGrid size={17}/>All groceries</Link>{CATEGORIES.map((c,i)=>{const Icon=categoryIcons[i];return <Link prefetch={false} key={c} href={categoryPath(c)} className={category===c?'active':''} aria-current={category===c?'page':undefined}><Icon size={17}/>{CATEGORY_SHORT[i]}</Link>;})}</div></nav>;
}
