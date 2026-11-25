import React,{useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Animated,BackHandler,Linking,View} from 'react-native';
import {WebView} from 'react-native-webview';
import {storeOrigin} from './api';
import {useTheme} from './theme';
import {Button,Icon,Txt} from './ui';
import {easeOut} from './motion';

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
   onShouldStartLoadWithRequest={request=>{if(onExit&&(request.url===storeOrigin||request.url===storeOrigin+'/')){onExit();return false;}if(request.url.startsWith(storeOrigin)||request.url==='about:blank')return true;void Linking.openURL(request.url).catch(()=>{});return false;}}/>
  {loading&&<View pointerEvents="none" style={{position:'absolute',top:0,left:0,right:0}}><Animated.View style={{height:3,backgroundColor:c.tint,width:progress.interpolate({inputRange:[0,1],outputRange:['0%','100%']})}}/><View style={{alignItems:'center',paddingTop:60}}><ActivityIndicator color={c.tint}/></View></View>}
 </View>;
}
