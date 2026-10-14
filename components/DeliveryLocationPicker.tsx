'use client';
import { useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin, RefreshCw, X } from 'lucide-react';
import type * as Leaflet from 'leaflet';
import { DELIVERY_LOCATION, DELIVERY_RADIUS_KM, STORE_ADDRESS, STORE_MAP_URL, deliveryDistanceKm, validPoint, withinDeliveryRange, type DeliveryPoint } from '@/lib/delivery';
import { useCart } from './CartProvider';
import Modal from './Modal';
export default function DeliveryLocationPicker({active=true}:{active?:boolean}){
  const {deliveryPoint,setDeliveryPoint}=useCart();const pointRef=useRef(deliveryPoint);pointRef.current=deliveryPoint;
  const callbackRef=useRef(setDeliveryPoint);callbackRef.current=setDeliveryPoint;
  const container=useRef<HTMLDivElement>(null),map=useRef<Leaflet.Map|null>(null),marker=useRef<Leaflet.Marker|null>(null),library=useRef<typeof Leaflet|null>(null);
  const [error,setError]=useState(''),[locating,setLocating]=useState(false),[ready,setReady]=useState(false),[retry,setRetry]=useState(0),[latitude,setLatitude]=useState(''),[longitude,setLongitude]=useState('');
  useEffect(()=>{
    if(!active||!container.current)return;let cancelled=false;let observer:ResizeObserver|undefined;setReady(false);
    import('leaflet').then(L=>{
      if(cancelled||!container.current)return;library.current=L;
      const center:Leaflet.LatLngExpression=[DELIVERY_LOCATION.latitude,DELIVERY_LOCATION.longitude];
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const instance=L.map(container.current,{scrollWheelZoom:false,minZoom:10,maxZoom:18,zoomAnimation:!reduced,fadeAnimation:!reduced}).setView(center,13);map.current=instance;
      let failed=0;const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'}).addTo(instance);
      tiles.on('tileerror',()=>{if(++failed>=3&&!cancelled)setError('Map tiles could not load. Use your current location or enter coordinates below.');});
      const circle=L.circle(center,{radius:DELIVERY_RADIUS_KM*1000,color:'#087e78',weight:2,fillColor:'#087e78',fillOpacity:.09}).addTo(instance);instance.fitBounds(circle.getBounds(),{padding:[12,12]});
      L.circleMarker(center,{radius:7,color:'#fff',weight:2,fillColor:'#021c19',fillOpacity:1}).addTo(instance).bindTooltip('Askari store',{permanent:true,direction:'top',offset:[0,-8]});
      const place=(point:DeliveryPoint)=>{
        if(!marker.current){marker.current=L.marker([point.latitude,point.longitude],{draggable:true,keyboard:true,title:'Delivery address pin',alt:'Your delivery address pin',icon:L.divIcon({className:'delivery-pin',html:'<span></span>',iconSize:[24,34],iconAnchor:[12,32]})}).addTo(instance);marker.current.on('dragend',()=>{const p=marker.current!.getLatLng();callbackRef.current({latitude:p.lat,longitude:p.lng});});}
        else marker.current.setLatLng([point.latitude,point.longitude]);
      };
      if(pointRef.current){place(pointRef.current);instance.panTo([pointRef.current.latitude,pointRef.current.longitude],{animate:false});}
      instance.on('click',(e:Leaflet.LeafletMouseEvent)=>{const point={latitude:e.latlng.lat,longitude:e.latlng.lng};place(point);callbackRef.current(point);setError('');});
      observer=new ResizeObserver(()=>instance.invalidateSize({animate:false}));observer.observe(container.current);setReady(true);
    }).catch(()=>{if(!cancelled)setError('The map could not open. Use your current location or enter coordinates below.');});
    return()=>{cancelled=true;observer?.disconnect();map.current?.remove();map.current=null;marker.current=null;};
  },[active,retry]);
  useEffect(()=>{
    if(!active||!ready||!deliveryPoint||!map.current||!library.current)return;
    const L=library.current,instance=map.current;
    if(marker.current)marker.current.setLatLng([deliveryPoint.latitude,deliveryPoint.longitude]);
    else{marker.current=L.marker([deliveryPoint.latitude,deliveryPoint.longitude],{draggable:true,keyboard:true,title:'Delivery address pin',alt:'Your delivery address pin',icon:L.divIcon({className:'delivery-pin',html:'<span></span>',iconSize:[24,34],iconAnchor:[12,32]})}).addTo(instance);marker.current.on('dragend',()=>{const p=marker.current!.getLatLng();callbackRef.current({latitude:p.lat,longitude:p.lng});});}
    instance.panTo([deliveryPoint.latitude,deliveryPoint.longitude],{animate:false});
  },[deliveryPoint,ready,active]);
  function locate(){
    setError('');if(!navigator.geolocation){setError('Location is unavailable in this browser. Choose a pin on the map or enter coordinates.');return;}
    setLocating(true);navigator.geolocation.getCurrentPosition(p=>{setDeliveryPoint({latitude:p.coords.latitude,longitude:p.coords.longitude});setLocating(false);if(p.coords.accuracy>200)setError('Your location is approximate. Move the pin to your exact delivery address.');},e=>{setLocating(false);setError(e.code===1?'Location permission was declined. Choose your delivery pin on the map instead.':'Could not find your location. Choose a map pin or enter coordinates.');},{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
  }
  function manual(){const point={latitude:Number(latitude),longitude:Number(longitude)};if(!latitude.trim()||!longitude.trim()||!validPoint(point)){setError('Enter valid latitude and longitude coordinates.');return;}setDeliveryPoint(point);setError('');}
  const allowed=withinDeliveryRange(deliveryPoint),distance=deliveryPoint?deliveryDistanceKm(deliveryPoint):null;
  return <section className="delivery-picker" aria-label="Check delivery distance"><div className="delivery-picker-heading"><div><h3>Your delivery pin</h3><p>Delivery within 5 km of our PGECHS Phase 1 store.</p></div><button type="button" className="secondary" disabled={locating} onClick={locate}><LocateFixed size={16}/>{locating?'Locating…':'Use my location'}</button></div><div ref={container} className="delivery-map" aria-label="Map showing Askari store and its 5 km delivery radius"/>
    {!ready&&!error&&<p className="delivery-map-loading" role="status">Opening delivery map…</p>}
    <p className={`delivery-result ${deliveryPoint?(allowed?'within':'outside'):''}`} role="status"><MapPin size={17}/>{deliveryPoint?allowed?`Within our delivery area · ${distance!.toFixed(2)} km from store`:`Outside our 5 km delivery area · ${distance!.toFixed(2)} km from store`:'Tap the map at your delivery address. Zoom in to choose the exact building.'}</p>
    {deliveryPoint&&!allowed&&<p className="delivery-outside-note">We can’t deliver to this pin. Choose a delivery address inside the marked circle.</p>}
    <a className="delivery-store-link" href={STORE_MAP_URL} target="_blank" rel="noreferrer">Store: {STORE_ADDRESS}</a>
    <p className="delivery-radius-note">The boundary is a 5 km radius measured in a straight line from the store.</p>
    {error&&<div className="form-message" role="alert">{error}<button className="delivery-retry" type="button" onClick={()=>{setError('');setRetry(v=>v+1);}}><RefreshCw size={14}/>Retry map</button></div>}
    <details className="delivery-coordinates"><summary>Enter coordinates instead</summary><div><label className="field">Latitude<input type="number" step="any" min="-90" max="90" inputMode="decimal" value={latitude} onChange={e=>setLatitude(e.target.value)} placeholder="31.41216075"/></label><label className="field">Longitude<input type="number" step="any" min="-180" max="180" inputMode="decimal" value={longitude} onChange={e=>setLongitude(e.target.value)} placeholder="74.27587375"/></label><button type="button" className="secondary" onClick={manual}>Check coordinates</button></div></details>
  </section>;
}
export function DeliveryAreaModal(){
  const {coverageOpen,setCoverageOpen,deliveryPoint}=useCart();
  return <Modal open={coverageOpen} onClose={()=>setCoverageOpen(false)} label="Our 5 km delivery area"><div className="modal-header"><MapPin size={25}/><button className="icon-button" aria-label="Close delivery area" onClick={()=>setCoverageOpen(false)}><X/></button></div><h2>We deliver nearby.</h2><p className="muted">Check your address before filling your basket.</p><DeliveryLocationPicker active={coverageOpen}/><button className="primary wide" onClick={()=>setCoverageOpen(false)}>{withinDeliveryRange(deliveryPoint)?'Save pin & continue shopping':'Continue browsing'}</button></Modal>;
}
