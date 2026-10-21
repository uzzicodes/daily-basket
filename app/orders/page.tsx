import OperationsPortal from '@/components/OperationsPortal';
import {operationSamples} from '@/lib/operation-samples';
export const metadata={title:'Packing desk | Daily Basket',robots:{index:false,follow:false},manifest:'/desk.webmanifest',appleWebApp:{capable:true,title:'Daily Basket Orders',statusBarStyle:'default' as const},icons:{apple:'/brand/daily-basket-app-icon-v2.png'}};
export default function PackerPage(){return <OperationsPortal mode="packer" samples={operationSamples().filter(o=>o.approval_status==='approved')}/>;}
