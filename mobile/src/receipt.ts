import {Platform} from 'react-native';
import * as Sharing from 'expo-sharing';
import {storeOrigin} from './api';
import * as storage from './storage';
export async function shareReceipt(id:string){
 const token=await storage.secret('receipt.'+id);if(!token)throw Error('The private receipt key is not on this phone. Contact the store with your order reference.');
 const origin=Platform.OS==='web'?window.location.origin:storeOrigin,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
 try{
  const response=await fetch(origin+'/api/mobile/receipt',{method:'POST',headers:{'Content-Type':'application/json','X-Askari-Client':'mobile-v1'},body:JSON.stringify({id,token}),signal:controller.signal});
  if(!response.ok){const data=await response.json();throw Error(data.error||'Could not download your receipt.');}
  if(!response.headers.get('Content-Type')?.includes('application/pdf'))throw Error('The receipt response was interrupted. Please try again.');
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(Platform.OS==='web'){const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');a.href=url;a.download='Receipt-'+id+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);return;}
  if(!await Sharing.isAvailableAsync())throw Error('File sharing is not available on this device.');
  const {File,Paths}=await import('expo-file-system');const file=new File(Paths.cache,'receipt-'+id+'.pdf');
  try{file.write(bytes);await Sharing.shareAsync(file.uri,{mimeType:'application/pdf',UTI:'com.adobe.pdf',dialogTitle:'Order receipt'});}finally{if(file.exists)file.delete();}
 }finally{clearTimeout(timer);}
}
