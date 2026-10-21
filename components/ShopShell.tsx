'use client';
import {useEffect,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {usePathname,useRouter,useSearchParams} from 'next/navigation';
import {ArrowRight,ArrowUpRight,ShoppingBag,ListChecks,MapPin} from 'lucide-react';
import {CartProvider,useCart} from './CartProvider';
import Navbar from './Navbar';import CategoryBar from './CategoryBar';import CartDrawer from './CartDrawer';import PaperListModal from './PaperListModal';import StoreLogo from './StoreLogo';import {DeliveryAreaModal} from './DeliveryLocationPicker';
import {departments} from '@/lib/shop-routes';
import {money} from '@/lib/constants';
import type {Product} from '@/lib/types';
const emptyProducts:Product[]=[];
export default function ShopShell({children,whatsappNumber,configured}:{children:ReactNode;whatsappNumber:string;configured:boolean}){return <CartProvider initialProducts={emptyProducts}><Shell whatsappNumber={whatsappNumber} configured={configured}>{children}</Shell></CartProvider>;}
function Shell({children,whatsappNumber,configured}:{children:ReactNode;whatsappNumber:string;configured:boolean}){
 const {products,quantities,setCartOpen,setPaperOpen,registerProducts}=useCart();const router=useRouter();const pathname=usePathname();const params=useSearchParams();const q=params.get('q')||'';
 const [search,setSearch]=useState(q),[matches,setMatches]=useState<Product[]>([]),[loading,setLoading]=useState(false);
 useEffect(()=>{setSearch(q);},[q,pathname]);
 useEffect(()=>{const controller=new AbortController();if(!search.trim()){setMatches([]);setLoading(false);return;}setLoading(true);const timer=setTimeout(()=>{fetch('/api/catalog?q='+encodeURIComponent(search.slice(0,100)),{cache:'no-store',signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json() as Promise<{products:Product[]}>;}).then(d=>{setMatches(d.products||[]);registerProducts(d.products||[]);}).catch(()=>{if(!controller.signal.aborted)setMatches([]);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});},250);return()=>{controller.abort();clearTimeout(timer);};},[search,registerProducts]);
 const lines=products.filter(p=>quantities[p.id]&&p.in_stock&&p.price!==null);const count=lines.reduce((s,p)=>s+quantities[p.id],0);const total=lines.reduce((s,p)=>s+p.price!*quantities[p.id],0);const category=departments.find(d=>pathname==='/category/'+d.slug)?.name||'All';
 const submit=()=>router.push('/shop'+(search.trim()?'?q='+encodeURIComponent(search.trim().slice(0,100)):''));
 return <><Navbar products={matches} search={search} setSearch={setSearch} loading={loading} onSearch={submit}/><CategoryBar category={category}/>{children}<section className="container store-bottom"><div className="paper-banner"><div><h2>A grocery list is all you need.</h2><p>Snap your handwritten list or type it out. Our counter team will take it from there.</p></div><button className="primary" onClick={()=>setPaperOpen(true)}><ListChecks size={18}/>Send your grocery list<ArrowUpRight size={17}/></button></div><div className="community-note"><MapPin size={17}/><p>Proudly serving our neighbours within 7 km of our dispatch point in PGECHS Phase 1, Lahore.</p></div></section><footer><div className="container footer-main"><StoreLogo/><p>Your neighbourhood, delivered.<br/><span>Everyday essentials. Everyday care.</span></p><button onClick={()=>setPaperOpen(true)}>Let’s help with your list<ArrowUpRight size={15}/></button></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Daily Basket · Lahore.</span><span>Cash on Delivery · Within 7 km</span><Link href="/orders">Order desk<ArrowRight size={12}/></Link></div></footer>{count>0&&<button className="mobile-basket" onClick={()=>setCartOpen(true)}><span><ShoppingBag size={20}/>{count} {count===1?'item':'items'} · <b>{money(total)}</b></span><strong>Checkout<ArrowRight size={17}/></strong></button>}<DeliveryAreaModal/><CartDrawer products={products} whatsappNumber={whatsappNumber} configured={configured}/><PaperListModal whatsappNumber={whatsappNumber}/></>;
}
