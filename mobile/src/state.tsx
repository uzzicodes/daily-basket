import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import {Alert} from 'react-native';
import * as Crypto from 'expo-crypto';
import {api,AppError} from './api';
import {available,refreshedLines,totals,rejectedAttempt,receiptOrder} from './domain';
import * as storage from './storage';
import {Language,LanguageContext} from './theme';
import type {Attempt,CartLine,Customer,Point,Product,SavedOrder,StoreConfig} from './types';

function useAppState(){
 const [ready,setReady]=useState(false),[config,setConfig]=useState<StoreConfig|null>(null),[error,setError]=useState('');
 const [language,setLanguage]=useState<Language>('en'),[cart,setCart]=useState<CartLine[]>([]),[favourites,setFavourites]=useState<string[]>([]),[orders,setOrders]=useState<SavedOrder[]>([]);
 const [point,setPoint]=useState<Point|null>(null),[savedCustomer,setSavedCustomer]=useState<Customer|null>(null),[pending,setPending]=useState<Attempt|null>(null),[pendingError,setPendingError]=useState(''),[busy,setBusy]=useState(false);
 const lock=useRef(false);
 async function connect(){setError('');try{setConfig(await api.config());}catch(e){setError((e as Error).message);}}
 useEffect(()=>{let mounted=true;(async()=>{
  const [basket,favs,history,lang,address]=await Promise.all([storage.read<CartLine[]>('cart',[]),storage.read<string[]>('favourites',[]),storage.read<SavedOrder[]>('orders',[]),storage.read<Language>('language','en'),storage.loadCustomer('address')]);
  if(!mounted)return;
  setCart(Array.isArray(basket)?basket.filter(l=>l?.product?.id&&Number.isInteger(l.quantity)&&l.quantity>0&&l.quantity<=99).slice(0,50):[]);
  setFavourites(Array.isArray(favs)?favs.filter(id=>typeof id==='string').slice(0,60):[]);setOrders(Array.isArray(history)?history.filter(o=>o?.id&&Array.isArray(o.items)).slice(0,20):[]);setLanguage(lang==='ur'?'ur':'en');setSavedCustomer(address);if(address)setPoint({latitude:address.delivery_latitude,longitude:address.delivery_longitude});
  try{setPending(await storage.loadAttempt());}catch(e){setPendingError((e as Error).message);}setReady(true);
 })();void connect();return()=>{mounted=false;};},[]);
 useEffect(()=>{if(ready)void storage.write('cart',cart).catch(()=>{});},[cart,ready]);
 useEffect(()=>{if(ready)void storage.write('favourites',favourites).catch(()=>{});},[favourites,ready]);
 useEffect(()=>{if(ready)void storage.write('language',language).catch(()=>{});},[language,ready]);
 function change(product:Product,delta:number){if(lock.current||pending||pendingError){Alert.alert(language==='ur'?'آرڈر کی تصدیق کریں':'Check your pending order',language==='ur'?'پہلے پچھلے آرڈر کی تصدیق کریں۔':'Please resolve the previous order before changing your basket.');return;}if(!available(product))return;setCart(lines=>{const current=lines.find(l=>l.product.id===product.id),quantity=Math.max(0,Math.min(99,(current?.quantity||0)+delta));if(!current&&lines.length>=50)return lines;return quantity?current?lines.map(l=>l.product.id===product.id?{product,quantity}:l):[...lines,{product,quantity}]:lines.filter(l=>l.product.id!==product.id);});}
 function favourite(id:string){setFavourites(ids=>ids.includes(id)?ids.filter(v=>v!==id):ids.length<60?[...ids,id]:ids);}
 async function refreshBasket(){const fresh=await api.catalog({ids:cart.map(l=>l.product.id)});const result=refreshedLines(cart,fresh.products);setCart(result.lines);return result;}
 async function reorder(order:SavedOrder){if(lock.current||pending||pendingError)throw Error('Please resolve the previous order first.');const data=await api.catalog({ids:order.items.map(l=>l.product.id)});const result=refreshedLines(order.items,data.products);setCart(result.lines);return result;}
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
 async function updateOrder(id:string){const token=await storage.secret('receipt.'+id);if(!token)throw Error('This receipt is not saved on this phone. Contact Askari with your order reference.');const {order}=await api.status(id,token);setOrders(history=>{const next=history.map(o=>o.id===id?receiptOrder(order,o.items):o);void storage.write('orders',next).catch(()=>{});return next;});return order;}
 async function forgetAddress(){await storage.saveCustomer('address',null);setSavedCustomer(null);setPoint(null);}
 async function clear(){if(lock.current||pending||pendingError)throw Error('Please contact Askari to resolve your pending order before clearing this phone.');await storage.clearDeviceData();setCart([]);setFavourites([]);setOrders([]);setSavedCustomer(null);setPoint(null);}
 return {ready,config,error,connect,language,setLanguage,cart,change,favourites,favourite,orders,point,setPoint,savedCustomer,pending,pendingError,busy,refreshBasket,reorder,place,updateOrder,forgetAddress,clear};
}
const AppContext=createContext<ReturnType<typeof useAppState>|null>(null);
export function AppProvider({children}:{children:React.ReactNode}){const state=useAppState();return <AppContext.Provider value={state}><LanguageContext.Provider value={{language:state.language,setLanguage:state.setLanguage}}>{children}</LanguageContext.Provider></AppContext.Provider>;}
export function useApp(){const state=useContext(AppContext);if(!state)throw Error('AppProvider missing');return state;}
