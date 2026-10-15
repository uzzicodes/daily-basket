import {CATEGORIES,CATEGORY_SHORT} from './constants';
import type {Product} from './types';
const slugs=['pantry','dairy-breakfast','tea-beverages','spices','snacks','laundry','household','baby-care','personal-care'];
const descriptions=[
 'Cooking oil, rice, flour and the staples that keep your kitchen going.',
 'Milk, dairy drinks and breakfast favourites. Find the pack that suits your home.',
 'Your daily cup, a refreshing drink and something for the whole family.',
 'Spices, seasonings and recipe mixes for the meals you love to make.',
 'Biscuits, chocolates, savouries and little treats for the cupboard.',
 'Detergents and fabric care for everyday washing.',
 'Cleaning essentials and practical supplies for every corner of your home.',
 'Everyday baby essentials. Check the exact age, size and pack on each label.',
 'Personal care, hygiene and the essentials in your daily routine.',
];
export const departments=CATEGORIES.map((name,i)=>({name,slug:slugs[i],label:CATEGORY_SHORT[i],description:descriptions[i]}));
export const categoryPath=(name:string)=>{const d=departments.find(d=>d.name===name);return d?'/category/'+d.slug:'/shop';};
export const productPath=(p:Pick<Product,'id'|'name'>)=>'/products/'+p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,85)+'--'+p.id;
export function productId(segment:string){const id=segment.slice(-36);return /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)?id:null;}
