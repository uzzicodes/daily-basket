import Link from 'next/link';
import {BRAND} from '@/lib/branding';
export default function StoreLogo(){return <Link className="store-logo customer-wordmark" href="/" aria-label={BRAND+' home'}><span className="customer-mark"><img src="/brand/daily-basket-mark-192.png" alt="" width={52} height={52}/></span><strong>{BRAND}</strong></Link>;}
