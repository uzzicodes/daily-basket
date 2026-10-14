import type { Metadata } from 'next';
import AdminDashboard from '@/components/AdminDashboard';
export const metadata:Metadata={title:'Owner Dashboard | Askari Departmental Store',robots:{index:false,follow:false}};
export default function AdminPage(){return <AdminDashboard/>;}
