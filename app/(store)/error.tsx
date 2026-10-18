'use client';
export default function StoreError({reset}:{reset:()=>void}){return <main className="container shop-load-error"><h1>The shelf is taking a moment.</h1><p>We couldn’t load the latest product details. Please try again.</p><button className="primary" onClick={reset}>Try again</button><a href="/">Return to Daily Basket</a></main>;}
