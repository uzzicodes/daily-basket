import type {Point} from './types';
// This small map is the only embedded web surface. Shopping/navigation remain React Native.
export function mapDocument(center:Point,initial:Point|null,radiusKm:number){return `<!doctype html><html><head><meta name="referrer" content="strict-origin-when-cross-origin"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;margin:0}body{font-family:system-ui;background:#e4f3eb}.leaflet-control-attribution{font-size:11px}.error{padding:24px}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
const store=[${center.latitude},${center.longitude}];
function emit(p){const msg=JSON.stringify({type:'askari-pin',latitude:p.lat,longitude:p.lng});if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(msg);else window.parent.postMessage(msg,'*');}
if(typeof L==='undefined'){document.getElementById('map').innerHTML='<div class="error">Map could not load. Use current location or enter coordinates.</div>';}else{
const map=L.map('map').setView(store,13);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);const area=L.circle(store,{radius:${radiusKm*1000},color:'#087e78',fillOpacity:.07}).addTo(map);map.fitBounds(area.getBounds(),{padding:[16,16]});L.control.scale({imperial:false}).addTo(map);L.circleMarker(store,{radius:6,color:'#087e78',fillOpacity:1}).addTo(map).bindTooltip('Daily Basket pickup point');let pin=null;
window.askariSetPoint=function(lat,lng){if(pin)pin.setLatLng([lat,lng]);else{pin=L.marker([lat,lng],{draggable:true}).addTo(map);pin.on('dragend',()=>emit(pin.getLatLng()));}map.panTo([lat,lng]);};
map.on('click',e=>{window.askariSetPoint(e.latlng.lat,e.latlng.lng);emit(e.latlng);});
${initial?`window.askariSetPoint(${initial.latitude},${initial.longitude});`:''}
window.addEventListener('message',e=>{let d;try{d=JSON.parse(e.data);}catch{return;}if(d.type==='askari-set'&&Number.isFinite(d.latitude)&&Number.isFinite(d.longitude))window.askariSetPoint(d.latitude,d.longitude);});}
</script></body></html>`;}
