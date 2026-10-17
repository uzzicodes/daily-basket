import {NextResponse} from 'next/server';
import {mobileRequestAllowed} from '@/lib/customer-receipt';
import {submitCheckout} from '@/lib/checkout';
export async function POST(request:Request){
 if(!mobileRequestAllowed(request))return NextResponse.json({error:'Invalid app request.'},{status:403});
 return submitCheckout(request,{customerReceipt:true});
}
