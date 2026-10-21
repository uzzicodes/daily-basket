import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {Platform} from 'react-native';
import type {Attempt,Customer} from './types';
const prefix='askari.v1.';
export async function read<T>(key:string,fallback:T):Promise<T>{try{const raw=await AsyncStorage.getItem(prefix+key);return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
export const write=(key:string,value:unknown)=>AsyncStorage.setItem(prefix+key,JSON.stringify(value));
export async function secret(key:string,value?:string|null){const name=prefix+key;if(Platform.OS==='web'){if(value===undefined)return typeof sessionStorage!=='undefined'?sessionStorage.getItem(name):null;if(value===null)sessionStorage.removeItem(name);else sessionStorage.setItem(name,value);return null;}if(value===undefined)return SecureStore.getItemAsync(name);if(value===null)await SecureStore.deleteItemAsync(name);else await SecureStore.setItemAsync(name,value);return null;}
const fields=['customer_name','customer_phone','delivery_area','delivery_address','delivery_latitude','delivery_longitude'] as const;
export async function saveCustomer(key:string,customer:Customer|null){await Promise.all(fields.map(field=>secret(key+'.'+field,customer?JSON.stringify(customer[field]):null)));}
export async function loadCustomer(key:string):Promise<Customer|null>{try{const values=await Promise.all(fields.map(field=>secret(key+'.'+field)));if(values.some(v=>v===null))return null;return Object.fromEntries(fields.map((field,i)=>[field,JSON.parse(values[i]!)])) as Customer;}catch{return null;}}
export async function saveAttempt(attempt:Attempt){await saveCustomer('pending',attempt.customer);const {customer,...rest}=attempt;await write('pending',rest);}
export async function loadAttempt():Promise<Attempt|null>{const stored=await read<Omit<Attempt,'customer'>|null>('pending',null);if(!stored)return null;const customer=await loadCustomer('pending');if(!customer)throw Error('The previous order needs checking. Please contact Daily Basket before placing it again.');return {...stored,customer};}
export async function clearAttempt(){await AsyncStorage.removeItem(prefix+'pending');await saveCustomer('pending',null);}
export async function clearDeviceData(){const keys=(await AsyncStorage.getAllKeys()).filter(k=>k.startsWith(prefix));const orders=await read<{id:string}[]>('orders',[]);await Promise.all(orders.map(o=>secret('receipt.'+o.id,null)));await saveCustomer('address',null);await saveCustomer('pending',null);await AsyncStorage.multiRemove(keys);}
