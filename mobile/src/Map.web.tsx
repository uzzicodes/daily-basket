import React,{useEffect,useRef} from 'react';
import {validPoint} from './domain';
import type {Point} from './types';
export default function DeliveryMap({center,point,onChange,radiusKm}:{center:Point;point:Point|null;radiusKm:number;onChange:(p:Point)=>void}){
 const ref=useRef<HTMLIFrameElement>(null),pointRef=useRef(point);pointRef.current=point;
 useEffect(()=>{const handle=(event:MessageEvent)=>{if(event.source!==ref.current?.contentWindow)return;try{const d=JSON.parse(event.data),p={latitude:d.latitude,longitude:d.longitude};if(d.type==='askari-pin'&&validPoint(p))onChange(p);}catch{}};window.addEventListener('message',handle);return()=>window.removeEventListener('message',handle);},[onChange]);
 const send=()=>{if(pointRef.current)ref.current?.contentWindow?.postMessage(JSON.stringify({type:'askari-set',...pointRef.current}),'*');};useEffect(send,[point]);
 return React.createElement('iframe',{ref,title:'Select delivery location',src:'/delivery-map',referrerPolicy:'strict-origin-when-cross-origin',onLoad:send,style:{border:0,width:'100%',height:'100%'}});
}
