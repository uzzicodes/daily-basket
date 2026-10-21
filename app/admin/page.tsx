import type { Metadata } from 'next';
import OwnerWorkspace from '@/components/OwnerWorkspace';
export const metadata:Metadata={title:'Owner Dashboard | Daily Basket',robots:{index:false,follow:false}};
export default function AdminPage(){return <OwnerWorkspace/>;}
