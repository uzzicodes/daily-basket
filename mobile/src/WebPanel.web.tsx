import React from 'react';
// In the browser preview the panel is the store page itself, framed under the app header.
export default function WebPanel({path}:{path:string;onLoadEnd?:()=>void}){
 return React.createElement('iframe',{title:'Daily Basket workspace',src:path,style:{border:0,width:'100%',height:'100%'}});
}
