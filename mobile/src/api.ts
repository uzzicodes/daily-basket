import {Platform} from 'react-native';
import type {Attempt,Catalog,StoreConfig,CustomerReceipt} from './types';
import {requestJSON} from './transport';
export {AppError} from './transport';
const publicStore='https://askari-lahore-groceries.jazzylark16.chatgpt.site';
export const storeOrigin=process.env.EXPO_PUBLIC_STORE_URL||publicStore;
const origin=Platform.OS==='web'&&typeof window!=='undefined'?window.location.origin:storeOrigin;
const request=<T>(path:string,options:RequestInit={})=>requestJSON<T>(origin,path,options);
export const api={
 config:()=>request<StoreConfig>('/api/mobile/config'),
 catalog:(filters:{q?:string;category?:string;available?:boolean;sort?:string;offset?:number;ids?:string[]},signal?:AbortSignal)=>{const p=new URLSearchParams();for(const [key,value] of Object.entries(filters)){if(value!==undefined)p.set(key,Array.isArray(value)?value.join(','):String(value));}return request<Catalog>('/api/catalog?'+p,{signal});},
 checkout:(attempt:Attempt)=>request<{order:CustomerReceipt;receipt_token:string}>('/api/mobile/checkout',{method:'POST',body:JSON.stringify({...attempt.customer,idempotency_key:attempt.idempotency_key,expected_total:attempt.expected_total,items:attempt.items})}),
 status:(id:string,token:string)=>request<{order:CustomerReceipt}>('/api/mobile/order-status',{method:'POST',body:JSON.stringify({id,token})}),
};
