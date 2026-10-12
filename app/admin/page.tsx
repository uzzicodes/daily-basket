import type { Metadata } from 'next';
import AdminDashboard from '@/components/AdminDashboard';
export const metadata:Metadata={title:'Store Counter | Askari Departmental Store',robots:{index:false,follow:false}};
export default function AdminPage(){return <AdminDashboard/>;}
