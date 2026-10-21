import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {Alert,AppState} from 'react-native';
import {refreshActiveReceipts} from './order-progress';
import * as Crypto from 'expo-crypto';
import {api,AppError} from './api';
import {available,refreshedLines,totals,rejectedAttempt,receiptOrder,rememberQuery,mergeProducts,displayName} from './domain';
import * as storage from './storage';
import {Language,LanguageContext} from './theme';
import type {Attempt,CartLine,Customer,Point,Product,SavedOrder,StoreConfig,ShoppingList,ListItem} from './types';

function useAppState(){
 const [ready,setReady]=useState(false),[config,setConfig]=useState<StoreConfig|null>(null),[error,setError]=useState('');
 const [language,setLanguage]=useState<Language>('en'),[cart,setCart]=useState<CartLine[]>([]),[favourites,setFavourites]=useState<string[]>([]),[orders,setOrders]=useState<SavedOrder[]>([]);
 const [appearance,setAppearance]=useState<'system'|'light'|'dark'>('system'),[recent,setRecent]=useState<string[]>([]),[searches,setSearches]=useState<string[]>([]),[lists,setLists]=useState<ShoppingList[]>([]);
 const cartRef=useRef(cart);cartRef.current=cart;
 const ordersRef=useRef(orders);ordersRef.current=orders;const statusRequests=useRef(new Map<string,Promise<unknown>>());
 const [orderSync,setOrderSync]=useState<Record<string,{updatedAt:number;error:string}>>({});
 const [point,setPoint]=useState<Point|null>(null),[savedCustomer,setSavedCustomer]=useState<Customer|null>(null),[pending,setPending]=useState<Attempt|null>(null),[pendingError,setPendingError]=useState(''),[busy,setBusy]=useState(false);
 const lock=useRef(false);const guard=useRef({pending,pendingError});guard.current={pending,pendingError};
 async function connect(){setError('');try{setConfig(await api.config());}catch(e){setError((e as Error).message);}}
 useEffect(()=>{let mounted=true;(async()=>{
  const [basket,favs,history,lang,address,pref,viewed,queries,checklists]=await Promise.all([storage.read<CartLine[]>('cart',[]),storage.read<string[]>('favourites',[]),storage.read<SavedOrder[]>('orders',[]),storage.read<Language>('language','en'),storage.loadCustomer('address'),storage.read<string>('appearance','system'),storage.read<string[]>('recent',[]),storage.read<string[]>('searches',[]),storage.read<ShoppingList[]>('lists',[])]);
  if(!mounted)return;
  setCart(Array.isArray(basket)?basket.filter(l=>l?.product?.id&&Number.isInteger(l.quantity)&&l.quantity>0&&l.quantity<=99).slice(0,50):[]);
  setFavourites(Array.isArray(favs)?favs.filter(id=>typeof id==='string').slice(0,60):[]);setOrders(Array.isArray(history)?history.filter(o=>o?.id&&Array.isArray(o.items)).slice(0,20):[]);setLanguage(lang==='ur'?'ur':'en');setSavedCustomer(address);if(address)setPoint({latitude:address.delivery_latitude,longitude:address.delivery_longitude});
  setAppearance(pref==='light'||pref==='dark'?pref:'system');setRecent(Array.isArray(viewed)?viewed.filter(v=>typeof v==='string').slice(0,20):[]);setSearches(Array.isArray(queries)?queries.filter(v=>typeof v==='string').slice(0,8):[]);setLists(Array.isArray(checklists)?checklists.filter(l=>typeof l?.id==='string'&&typeof l.name==='string'&&Array.isArray(l.items)).slice(0,8).map(l=>({...l,items:l.items.filter(i=>typeof i?.id==='string'&&typeof i.text==='string').slice(0,60)})):[]);
  try{setPending(await storage.loadAttempt());}catch(e){setPendingError((e as Error).message);}setReady(true);
 })();void connect();return()=>{mounted=false;};},[]);
 useEffect(()=>{if(ready)void storage.write('cart',cart).catch(()=>{});},[cart,ready]);
 useEffect(()=>{if(ready)void storage.write('favourites',favourites).catch(()=>{});},[favourites,ready]);
 useEffect(()=>{if(ready)void storage.write('language',language).catch(()=>{});},[language,ready]);
 useEffect(()=>{if(ready)void storage.write('appearance',appearance).catch(()=>{});},[appearance,ready]);
 useEffect(()=>{if(ready)void storage.write('recent',recent).catch(()=>{});},[recent,ready]);
 useEffect(()=>{if(ready)void storage.write('searches',searches).catch(()=>{});},[searches,ready]);
 useEffect(()=>{if(ready)void storage.write('lists',lists).catch(()=>{});},[lists,ready]);
 const viewProduct=React.useCallback((id:string)=>setRecent(ids=>[id,...ids.filter(v=>v!==id)].slice(0,20)),[]);
 function search(query:string){setSearches(history=>rememberQuery(history,query));}
 function createList(name:string,items:Omit<ListItem,'id'>[]=[]){if(lists.length>=8)throw Error(language==='ur'?'پہلے پرانی فہرست ہٹائیں۔':'You can keep eight lists. Remove an old list before creating another.');const list={id:Crypto.randomUUID(),name:name.trim().slice(0,80)||(language==='ur'?'میری گروسری':'My groceries'),items:items.slice(0,60).map(item=>({...item,id:Crypto.randomUUID()}))};setLists(previous=>[list,...previous]);return list.id;}
 function saveBasket(name:string){return createList(name,cartRef.current.map(line=>({text:line.quantity+' × '+displayName(line.product)+' · '+line.product.unit,checked:false,product_id:line.product.id,quantity:line.quantity})));}
 function addToList(id:string,text:string,product?:Product){const item:ListItem={id:Crypto.randomUUID(),text:text.trim().slice(0,200),checked:false,...(product?{product_id:product.id,quantity:1}:{})};if(!item.text)return;setLists(previous=>previous.map(l=>l.id===id&&l.items.length<60?{...l,items:[...l.items,item]}:l));}
 function toggleListItem(id:string,itemId:string){setLists(previous=>previous.map(l=>l.id===id?{...l,items:l.items.map(i=>i.id===itemId?{...i,checked:!i.checked}:i)}:l));}
 function removeListItem(id:string,itemId:string){setLists(previous=>previous.map(l=>l.id===id?{...l,items:l.items.filter(i=>i.id!==itemId)}:l));}
 function removeList(id:string){setLists(previous=>previous.filter(l=>l.id!==id));}
 async function addListToBasket(id:string){if(lock.current||guard.current.pending||guard.current.pendingError)throw Error('Please resolve your pending order first.');const list=lists.find(l=>l.id===id);const requested=list?.items.filter(i=>!i.checked&&i.product_id).map(i=>({product_id:i.product_id!,quantity:i.quantity||1}))||[];if(!requested.length)throw Error(language==='ur'?'اشیاء پہلے کیٹلاگ سے منتخب کریں، یا فہرست اسٹور کو بھیجیں۔':'Add catalogue products to this list, or send your written list to the store.');const data=await api.catalog({ids:[...new Set(requested.map(i=>i.product_id))]});if(lock.current||guard.current.pending||guard.current.pendingError)throw Error('Please resolve your pending order first.');const result=mergeProducts(cartRef.current,requested,data.products);setCart(result.lines);return result;}
 function change(product:Product,delta:number){if(lock.current||pending||pendingError){Alert.alert(language==='ur'?'آرڈر کی تصدیق کریں':'Check your pending order',language==='ur'?'پہلے پچھلے آرڈر کی تصدیق کریں۔':'Please resolve the previous order before changing your basket.');return;}if(!available(product))return;setCart(lines=>{const current=lines.find(l=>l.product.id===product.id),quantity=Math.max(0,Math.min(99,(current?.quantity||0)+delta));if(!current&&lines.length>=50)return lines;return quantity?current?lines.map(l=>l.product.id===product.id?{product,quantity}:l):[...lines,{product,quantity}]:lines.filter(l=>l.product.id!==product.id);});}
 function favourite(id:string){setFavourites(ids=>ids.includes(id)?ids.filter(v=>v!==id):ids.length<60?[...ids,id]:ids);}
 async function refreshBasket(){const fresh=await api.catalog({ids:cart.map(l=>l.product.id)});const result=refreshedLines(cart,fresh.products);setCart(result.lines);return result;}
 async function reorder(order:SavedOrder){if(lock.current||guard.current.pending||guard.current.pendingError)throw Error('Please resolve the previous order first.');const data=await api.catalog({ids:order.items.map(l=>l.product.id)});if(lock.current||guard.current.pending||guard.current.pendingError)throw Error('Please resolve the previous order first.');const result=refreshedLines(order.items,data.products);setCart(result.lines);return result;}
 async function place(customer:Customer,remember:boolean){
  if(lock.current)throw Error('Your order is already being checked.');if(!config)throw Error('Connect to the store before ordering.');if(pendingError)throw Error(pendingError);
  lock.current=true;setBusy(true);
  try{
   let attempt=pending;
   if(!attempt){
    if(!cart.length)throw Error('Your basket is empty.');const fresh=await refreshBasket();if(fresh.changed)throw new AppError('Prices or availability changed. Review your basket before ordering.',409,'REVIEW_BASKET');
    attempt={idempotency_key:Crypto.randomUUID(),expected_total:totals(fresh.lines,config).total_amount,items:fresh.lines.map(l=>({product_id:l.product.id,quantity:l.quantity})),customer,lines:fresh.lines};
    try{await storage.saveAttempt(attempt);}catch{throw Error('This phone could not save the order attempt. Please check available storage.');}setPending(attempt);
   }
   let response;
   try{response=await api.checkout(attempt);}catch(e){if(e instanceof AppError&&rejectedAttempt(e)){await storage.clearAttempt();setPending(null);await refreshBasket();}throw e;}
   const saved=receiptOrder(response.order,attempt.lines);
   // A confirmed server order must never be reported as a failed checkout because local storage failed.
   let savedLocally=true;
   try{await storage.secret('receipt.'+saved.id,response.receipt_token);const history=[saved,...orders.filter(o=>o.id!==saved.id)].slice(0,20);await storage.write('orders',history);setOrders(history);}catch{savedLocally=false;setOrders(history=>[saved,...history.filter(o=>o.id!==saved.id)].slice(0,20));}
   try{await storage.clearAttempt();setPending(null);}catch{setPending(attempt);}
   setCart([]);
   if(remember){try{await storage.saveCustomer('address',attempt.customer);setSavedCustomer(attempt.customer);}catch{savedLocally=false;}}
   return {order:saved,savedLocally};
  }finally{lock.current=false;setBusy(false);}
 }
 const updateOrder=React.useCallback((id:string)=>{const current=statusRequests.current.get(id);if(current)return current;const task=(async()=>{try{const token=await storage.secret('receipt.'+id);if(!token)throw Error('This receipt is not saved on this phone. Contact the store with your order reference.');const {order}=await api.status(id,token);setOrders(history=>{const next=history.map(o=>o.id===id?receiptOrder(order,o.items):o);void storage.write('orders',next).catch(()=>{});return next;});setOrderSync(previous=>({...previous,[id]:{updatedAt:Date.now(),error:''}}));return order;}catch(e){setOrderSync(previous=>({...previous,[id]:{updatedAt:previous[id]?.updatedAt||0,error:(e as Error).message}}));throw e;}finally{statusRequests.current.delete(id);}})();statusRequests.current.set(id,task);return task;},[]);
 useEffect(()=>{if(!ready)return;const refresh=()=>{if(AppState.currentState==='active')void refreshActiveReceipts(ordersRef.current,updateOrder);};refresh();const timer=setInterval(refresh,15000),listener=AppState.addEventListener('change',state=>{if(state==='active')refresh();});return()=>{clearInterval(timer);listener.remove();};},[ready,updateOrder]);
 async function forgetAddress(){await storage.saveCustomer('address',null);setSavedCustomer(null);setPoint(null);}
 async function clear(){if(lock.current||guard.current.pending||guard.current.pendingError)throw Error('Please contact the store to resolve your pending order before clearing this phone.');await storage.clearDeviceData();setCart([]);setFavourites([]);setOrders([]);setRecent([]);setSearches([]);setLists([]);setSavedCustomer(null);setPoint(null);}
 return {ready,config,error,connect,language,setLanguage,appearance,setAppearance,cart,change,favourites,favourite,orders,point,setPoint,savedCustomer,pending,pendingError,busy,refreshBasket,reorder,place,updateOrder,orderSync,forgetAddress,clear,recent,viewProduct,searches,search,clearSearches:()=>setSearches([]),lists,createList,saveBasket,addToList,toggleListItem,removeListItem,removeList,addListToBasket};
}
const AppContext=createContext<ReturnType<typeof useAppState>|null>(null);
export function AppProvider({children}:{children:React.ReactNode}){const state=useAppState();return <AppContext.Provider value={state}><LanguageContext.Provider value={{language:state.language,setLanguage:state.setLanguage,appearance:state.appearance,setAppearance:state.setAppearance}}>{children}</LanguageContext.Provider></AppContext.Provider>;}
export function useApp(){const state=useContext(AppContext);if(!state)throw Error('AppProvider missing');return state;}
