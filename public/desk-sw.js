/* Order desk only. Never cache order pages, customer details, or API responses. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let value={};try{value=event.data?.json()||{};}catch{}
 const safeUrl=typeof value.url==='string'&&/^\/orders(?:\?order=ORD-[\da-f-]{36})?$/i.test(value.url)?value.url:'/orders';
 event.waitUntil(self.registration.showNotification(value.title||'Daily Basket order desk',{body:value.body||'Open the order desk to see new orders.',icon:'/desk-icon-192.png',badge:'/desk-badge.png',tag:value.tag||'askari-orders',renotify:false,data:{url:safeUrl}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const url=new URL(event.notification.data?.url||'/orders',self.location.origin).href;
 event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});const existing=windows.find(w=>new URL(w.url).origin===self.location.origin&&new URL(w.url).pathname==='/orders');if(existing){await existing.navigate(url);return existing.focus();}return self.clients.openWindow(url);})());
});
