import React,{useState} from 'react';
import {View} from 'react-native';
import {useTheme} from './theme';
import {Button,Heading,Icon,Notice,Txt} from './ui';
import {customerOrderProgress} from './order-progress';
export function OrderTimeline({status}:{status:string}){
 const {c,language}=useTheme(),progress=customerOrderProgress(status,language);
 return <View style={{gap:4}}>{progress.steps.map((label,index)=><View key={label} accessibilityLabel={label+(index<=progress.stage?' · '+(language==='ur'?'مکمل':'complete'):'')} style={{minHeight:48,flexDirection:'row',alignItems:'center',gap:14}}><Icon name={index<=progress.stage?'checkmark-circle':'ellipse-outline'} color={index<=progress.stage?c.tint:c.muted}/><Txt style={{color:index<=progress.stage?c.text:c.muted,fontWeight:index===progress.stage?'700':'400'}}>{label}</Txt></View>)}</View>;
}
export function TrackingPreview(){
 const {c,language}=useTheme(),[status,setStatus]=useState('Pending'),progress=customerOrderProgress(status,language);
 return <View style={{gap:14,padding:18,borderWidth:1,borderColor:c.line,borderRadius:16}}><Notice text={language==='ur'?'فرضی اسٹیٹس کا پیش منظر · کوئی آرڈر نہیں دیا گیا۔':'Fictional tracking preview · No order has been placed.'}/><Heading>{progress.label}</Heading><OrderTimeline status={status}/><View style={{gap:8}}>{['Pending','Out for Delivery','Delivered'].map(value=><Button secondary key={value} title={customerOrderProgress(value,language).label} onPress={()=>setStatus(value)}/>)}</View><Txt style={{fontSize:13,color:c.muted}}>{language==='ur'?'اصل آرڈرز ایپ کھلی ہونے پر ہر ۱۵ سیکنڈ بعد اپڈیٹ ہوتے ہیں۔':'Real active orders update automatically every 15 seconds while the app is open.'}</Txt></View>;
}
