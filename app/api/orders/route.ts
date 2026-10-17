import {NextResponse} from 'next/server';
import {sameOrigin} from '@/lib/security';
import {submitCheckout} from '@/lib/checkout';
export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:'Invalid request origin.'},{status:403});
  return submitCheckout(request);
}
