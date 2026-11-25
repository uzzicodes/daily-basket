import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Alert,Animated,BackHandler,Linking,View} from 'react-native';
import * as Print from 'expo-print';
import {storeBillHtml,type BillOrder,type BillPaper} from './store-bill';
import {WebView} from 'react-native-webview';
import {storeOrigin} from './api';
import {useTheme} from './theme';
import {Button,Icon,Txt} from './ui';
import {easeOut} from './motion';

// The manager desk and admin dashboard ask the app to print a customer bill. Android printing sends it to the
// store's receipt printer (for Bluetooth thermal printers, through the printer's print service app).
function printBill(order:BillOrder){
 const print=(paper:BillPaper)=>void Print.printAsync({html:storeBillHtml(order,paper)}).catch(e=>{if(!/cancel/i.test(String((e as Error)?.message)))Alert.alert('Daily Basket','The bill could not be printed. Check the printer and try again.');});
 Alert.alert('Print bill','Choose the printer paper roll width.',[{text:'Cancel',style:'cancel'},{text:'58 mm (small)',onPress:()=>print('58')},{text:'80 mm (wide)',onPress:()=>print('80')}]);
}
const validBill=(o:any):o is BillOrder=>!!o&&typeof o.id==='string'&&typeof o.customer_name==='string'&&Array.isArray(o.items)&&o.items.length<=60&&o.items.every((i:any)=>typeof i?.name==='string'&&Number.isFinite(i.quantity)&&Number.isFinite(i.price))&&[o.subtotal,o.delivery_fee,o.total_amount].every(Number.isFinite);
// The owner and manager workspaces are secure store web pages. They open inside the app so the
// person never leaves Daily Basket; the page keeps its own sign-in cookie inside this web view.
export default function WebPanel({path,onExit}:{path:string;onExit?:()=>void}){
 const {c}=useTheme(),ref=useRef<WebView>(null),back=useRef(false),[failed,setFailed]=useState(false),[loading,setLoading]=useState(true),[key,setKey]=useState(0);
 const progress=useRef(new Animated.Value(0)).current;
 useEffect(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{if(back.current){ref.current?.goBack();return true;}onExit?.();return !!onExit;});return()=>sub.remove();},[onExit]);
 if(failed)return <View style={{flex:1,alignItems:'center',justifyContent:'center',padding:28,gap:16,backgroundColor:c.background}}><Icon name="cloud-offline-outline" size={40} color={c.tint}/><Txt style={{fontSize:20,fontWeight:'700',textAlign:'center'}}>Could not open the workspace</Txt><Txt style={{color:c.muted,textAlign:'center'}}>Check the internet connection and try again.</Txt><Button title="Try again" icon="refresh-outline" onPress={()=>{setFailed(false);setLoading(true);setKey(k=>k+1);}}/></View>;
 return <View style={{flex:1,backgroundColor:c.background}}>
  <WebView key={key} ref={ref} source={{uri:storeOrigin+path}} originWhitelist={['https://*']} sharedCookiesEnabled thirdPartyCookiesEnabled={false} domStorageEnabled javaScriptEnabled setSupportMultipleWindows={false} pullToRefreshEnabled allowsBackForwardNavigationGestures
   style={{flex:1,backgroundColor:c.background}}
   onNavigationStateChange={state=>{back.current=state.canGoBack;}}
   onLoadProgress={({nativeEvent})=>Animated.timing(progress,{toValue:nativeEvent.progress,duration:160,easing:easeOut,useNativeDriver:false}).start()}
   onLoadEnd={()=>setLoading(false)}
   onError={()=>setFailed(true)}
   onMessage={({nativeEvent})=>{if(!nativeEvent.url.startsWith(storeOrigin))return;try{const data=JSON.parse(nativeEvent.data);if(data?.type==='daily-basket-print-bill'&&validBill(data.order))printBill(data.order);}catch{}}}
   onShouldStartLoadWithRequest={request=>{if(onExit&&(request.url===storeOrigin||request.url===storeOrigin+'/')){onExit();return false;}if(request.url.startsWith(storeOrigin)||request.url==='about:blank')return true;void Linking.openURL(request.url).catch(()=>{});return false;}}/>
  {loading&&<View pointerEvents="none" style={{position:'absolute',top:0,left:0,right:0}}><Animated.View style={{height:3,backgroundColor:c.tint,width:progress.interpolate({inputRange:[0,1],outputRange:['0%','100%']})}}/><View style={{alignItems:'center',paddingTop:60}}><ActivityIndicator color={c.tint}/></View></View>}
 </View>;
}
