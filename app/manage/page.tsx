import OperationsPortal from '@/components/OperationsPortal';
import {operationSamples} from '@/lib/operation-samples';
export const metadata={title:'Manager cash desk | Daily Basket',robots:{index:false,follow:false}};
export default function ManagerPage(){return <OperationsPortal mode="manager" samples={operationSamples()}/>;}
