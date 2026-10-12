'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
type CartState = { quantities: Record<string, number>; change: (id: string, delta: number) => void; remove: (id: string) => void; clear: () => void; area: string; setArea: (area: string) => void; cartOpen: boolean; setCartOpen: (v: boolean) => void; paperOpen: boolean; setPaperOpen: (v: boolean) => void };
const CartContext = createContext<CartState | null>(null);
export function CartProvider({children}: {children: ReactNode}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [area, setArea] = useState('DHA Phase 5');
  const [cartOpen, setCartOpen] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem('barakah-basket') || '{}'); if (saved && typeof saved === 'object' && !Array.isArray(saved)) setQuantities(Object.fromEntries(Object.entries(saved).filter(([k,v])=>/^[\da-f-]{36}$/i.test(k) && Number.isInteger(v) && Number(v)>0 && Number(v)<=99)) as Record<string,number>); const savedArea=localStorage.getItem('barakah-area'); if(savedArea) setArea(savedArea); } catch {} setReady(true); }, []);
  useEffect(() => { if(ready) { try { localStorage.setItem('barakah-basket', JSON.stringify(quantities)); localStorage.setItem('barakah-area', area); } catch {} } }, [quantities, area, ready]);
  const change = (id:string, delta:number) => setQuantities(prev => {const next={...prev}; const count=Math.min(99, Math.max(0,(prev[id] || 0) + delta)); if(count) next[id]=count; else delete next[id]; return next;});
  const remove = (id:string) => setQuantities(prev => { const next={...prev}; delete next[id]; return next; });
  return <CartContext.Provider value={{quantities,change,remove,clear:()=>setQuantities({}),area,setArea,cartOpen,setCartOpen,paperOpen,setPaperOpen}}>{children}</CartContext.Provider>;
}
export function useCart() {const context=useContext(CartContext); if(!context) throw new Error('CartProvider is required'); return context;}
