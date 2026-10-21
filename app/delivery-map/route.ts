import {DELIVERY_LOCATION,DELIVERY_RADIUS_KM} from '@/lib/delivery';
import {mapDocument} from '@/mobile/src/map-document';
// A real document URL gives tile requests an honest Referer instead of an opaque srcDoc origin.
export function GET(){return new Response(mapDocument(DELIVERY_LOCATION,null,DELIVERY_RADIUS_KM),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=300','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'none'; script-src https://unpkg.com 'unsafe-inline'; style-src https://unpkg.com 'unsafe-inline'; img-src https://tile.openstreetmap.org https://unpkg.com data:; base-uri 'none'; form-action 'none'"}});}
