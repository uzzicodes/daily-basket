// Store pin resolved from the owner's Google Maps link, 14 October 2026.
export const DELIVERY_LOCATION={latitude:31.41216075,longitude:74.27587375};
export const DELIVERY_RADIUS_KM=7;
export const STORE_ADDRESS='84, Block C2, PGECHS Phase 1, Lahore';
export const STORE_MAP_URL='https://maps.app.goo.gl/Qezc8HXgwTKg2Hk66?g_st=ic';
export type DeliveryPoint={latitude:number;longitude:number};
export function validPoint(point:DeliveryPoint){return Number.isFinite(point.latitude)&&Number.isFinite(point.longitude)&&Math.abs(point.latitude)<=90&&Math.abs(point.longitude)<=180;}
export function deliveryDistanceKm(point:DeliveryPoint){
  if(!validPoint(point))return Infinity;
  const rad=(n:number)=>n*Math.PI/180;const lat=rad(point.latitude),storeLat=rad(DELIVERY_LOCATION.latitude);
  const a=Math.sin((lat-storeLat)/2)**2+Math.cos(storeLat)*Math.cos(lat)*Math.sin(rad(point.longitude-DELIVERY_LOCATION.longitude)/2)**2;
  return 6371*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,a))));
}
export function withinDeliveryRange(point:DeliveryPoint|null|undefined){return !!point&&deliveryDistanceKm(point)<=DELIVERY_RADIUS_KM+1e-9;}
export function deliveryPinUrl(point:DeliveryPoint){return `https://www.google.com/maps?q=${point.latitude.toFixed(7)},${point.longitude.toFixed(7)}`;}
