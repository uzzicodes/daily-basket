import React,{useEffect,useRef} from 'react';
import {WebView} from 'react-native-webview';
import {validPoint} from './domain';
import {storeOrigin} from './api';
import type {Point} from './types';
export default function DeliveryMap({center,point,onChange,radiusKm}:{center:Point;point:Point|null;radiusKm:number;onChange:(p:Point)=>void}){
 const ref=useRef<WebView>(null),pointRef=useRef(point);pointRef.current=point;
 const send=()=>{const p=pointRef.current;if(p&&validPoint(p))ref.current?.injectJavaScript(`window.askariSetPoint&&window.askariSetPoint(${p.latitude},${p.longitude});true;`);};useEffect(send,[point]);
 return <WebView ref={ref} source={{uri:storeOrigin+'/delivery-map'}} applicationNameForUserAgent="DailyBasket/1.0.3 (+https://askari-lahore-groceries.jazzylark16.chatgpt.site)" style={{flex:1}} originWhitelist={[storeOrigin]} onShouldStartLoadWithRequest={request=>{if(request.url==='about:blank')return true;try{const u=new URL(request.url);return u.origin===storeOrigin&&u.pathname==='/delivery-map';}catch{return false;}}} onLoadEnd={send} javaScriptEnabled onMessage={event=>{try{const d=JSON.parse(event.nativeEvent.data),p={latitude:d.latitude,longitude:d.longitude};if(d.type==='askari-pin'&&validPoint(p))onChange(p);}catch{}}}/>;
}
