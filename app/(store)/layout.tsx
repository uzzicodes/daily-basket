import {Suspense,type ReactNode} from 'react';
import ShopShell from '@/components/ShopShell';
import {databaseConfigured} from '@/lib/supabase';
import {STORE_WHATSAPP_DEFAULT} from '@/lib/constants';
export const dynamic='force-dynamic';
export default function StoreLayout({children}:{children:ReactNode}){const number=process.env.STORE_WHATSAPP_NUMBER||STORE_WHATSAPP_DEFAULT;return <Suspense fallback={<main className="container shop-loading">Opening Askari…</main>}><ShopShell configured={databaseConfigured()} whatsappNumber={/^\d{10,15}$/.test(number)?number:''}>{children}</ShopShell></Suspense>;}
