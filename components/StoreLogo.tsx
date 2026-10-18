import Link from 'next/link';
import {ShoppingBasket} from 'lucide-react';
import {BRAND} from '@/lib/branding';
export default function StoreLogo(){return <Link className="store-logo customer-wordmark" href="/" aria-label={BRAND+' home'}><span className="customer-mark"><ShoppingBasket size={32} strokeWidth={1.8}/></span><strong>{BRAND}</strong></Link>;}
