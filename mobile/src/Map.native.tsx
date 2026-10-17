import React,{useEffect,useRef} from 'react';
import {WebView} from 'react-native-webview';
import {mapDocument} from './map-document';
import {validPoint} from './domain';
import type {Point} from './types';
export default function DeliveryMap({center,point,onChange}:{center:Point;point:Point|null;onChange:(p:Point)=>void}){const ref=useRef<WebView>(null),html=useRef(mapDocument(center,point));useEffect(()=>{if(point&&validPoint(point))ref.current?.injectJavaScript(`window.askariSetPoint&&window.askariSetPoint(${point.latitude},${point.longitude});true;`);},[point]);return <WebView ref={ref} source={{html:html.current}} style={{flex:1}} originWhitelist={['about:blank']} onShouldStartLoadWithRequest={request=>request.url==='about:blank'} javaScriptEnabled onMessage={event=>{try{const d=JSON.parse(event.nativeEvent.data),p={latitude:d.latitude,longitude:d.longitude};if(d.type==='askari-pin'&&validPoint(p))onChange(p);}catch{}}}/>;}
