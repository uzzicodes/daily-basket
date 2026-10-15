import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import {departments} from '@/lib/shop-routes';
export default function CategoryTiles({expanded=false}:{expanded?:boolean}){
 return <section className={'department-section'+(expanded?' expanded':'')} aria-label="Shop by department"><div className="section-heading"><div><h2>Shop by department</h2><p>A place for everything on your list.</p></div>{!expanded&&<Link href="/categories">All departments<ArrowRight size={16}/></Link>}</div><div className="department-tiles">{departments.map(d=><Link prefetch={false} href={'/category/'+d.slug} className="department-tile" key={d.slug}><span className="department-icon"><img src={`/images/departments/${d.slug}.webp`} width={240} height={240} alt="" loading="lazy"/></span><strong>{d.label}</strong>{expanded&&<p>{d.description}</p>}</Link>)}</div></section>;
}
