import Link from 'next/link';import CategoryTiles from '@/components/CategoryTiles';
export const metadata={title:'Shop by department | Daily Basket'};
export default function Categories(){return <main className="container departments-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Departments</span></nav><h1>Everything in its place.</h1><p>Find your everyday essentials, one department at a time.</p><CategoryTiles expanded/></main>;}
