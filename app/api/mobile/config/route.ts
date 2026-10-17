import {NextResponse} from 'next/server';
import {STORE,FREE_DELIVERY,DELIVERY_FEE,STORE_WHATSAPP_DEFAULT} from '@/lib/constants';
import {DELIVERY_LOCATION,DELIVERY_RADIUS_KM,STORE_ADDRESS} from '@/lib/delivery';
import {departments} from '@/lib/shop-routes';
export function GET(){return NextResponse.json({store:STORE,address:STORE_ADDRESS,whatsapp:process.env.STORE_WHATSAPP_NUMBER||STORE_WHATSAPP_DEFAULT,delivery_fee:DELIVERY_FEE,free_delivery:FREE_DELIVERY,radius_km:DELIVERY_RADIUS_KM,location:DELIVERY_LOCATION,departments},{headers:{'Cache-Control':'public, max-age=300'}});}
