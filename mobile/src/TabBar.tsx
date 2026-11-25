import React,{useEffect,useRef,useState} from 'react';
import {Animated,Keyboard,Platform,Pressable,View} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from './theme';
import {Txt} from './ui';
import {tap,usePop,useReducedMotion} from './motion';

const PILL=60;
// The shopping tab bar: a soft pill glides behind the chosen tab, its icon fills in and bounces,
// and the basket badge pops whenever the count changes.
export function TabBar({state,descriptors,navigation}:BottomTabBarProps){
 const {c}=useTheme(),insets=useSafeAreaInsets(),reduce=useReducedMotion(),[width,setWidth]=useState(0),[keyboard,setKeyboard]=useState(false);
 const index=useRef(new Animated.Value(state.index)).current,tabWidth=width/state.routes.length;
 useEffect(()=>{if(reduce){index.setValue(state.index);return;}Animated.spring(index,{toValue:state.index,speed:16,bounciness:7,useNativeDriver:true}).start();},[state.index,reduce]);
 useEffect(()=>{if(Platform.OS!=='android')return;const show=Keyboard.addListener('keyboardDidShow',()=>setKeyboard(true)),hide=Keyboard.addListener('keyboardDidHide',()=>setKeyboard(false));return()=>{show.remove();hide.remove();};},[]);
 if(keyboard)return null;
 return <View style={{backgroundColor:c.surface,borderTopWidth:1,borderColor:c.line,paddingBottom:Math.max(insets.bottom,8),paddingTop:8}}>
  <View onLayout={event=>setWidth(event.nativeEvent.layout.width)} style={{flexDirection:'row'}}>
   {width>0&&<Animated.View pointerEvents="none" style={{position:'absolute',top:0,left:(tabWidth-PILL)/2,width:PILL,height:34,borderRadius:17,backgroundColor:c.soft,transform:[{translateX:Animated.multiply(index,tabWidth)}]}}/>}
   {state.routes.map((route,i)=>{const {options}=descriptors[route.key],focused=state.index===i,label=typeof options.title==='string'?options.title:route.name;
    const press=()=>{const event=navigation.emit({type:'tabPress',target:route.key,canPreventDefault:true});if(!focused&&!event.defaultPrevented){tap();navigation.navigate(route.name,route.params);}};
    return <Tab key={route.key} focused={focused} label={label} badge={options.tabBarBadge} accessibilityLabel={options.tabBarAccessibilityLabel} onPress={press} onLongPress={()=>navigation.emit({type:'tabLongPress',target:route.key})} icon={options.tabBarIcon?.({focused,color:focused?c.tint:c.muted,size:24})}/>;})}
  </View>
 </View>;
}
function Tab({focused,label,badge,icon,accessibilityLabel,onPress,onLongPress}:{focused:boolean;label:string;badge?:string|number;icon:React.ReactNode;accessibilityLabel?:string;onPress:()=>void;onLongPress:()=>void}){
 const {c}=useTheme(),bounce=usePop(focused,1.16,focused),badgePop=usePop(badge,1.35);
 return <Pressable accessibilityRole="tab" accessibilityState={{selected:focused}} accessibilityLabel={accessibilityLabel} onPress={onPress} onLongPress={onLongPress} style={{flex:1,alignItems:'center',gap:4,minHeight:52}}>
  <Animated.View style={{height:34,justifyContent:'center',transform:[{scale:bounce}]}}>{icon}
   {badge!==undefined&&<Animated.View style={{position:'absolute',top:0,right:-14,minWidth:20,height:20,paddingHorizontal:5,borderRadius:10,backgroundColor:c.tint,borderWidth:2,borderColor:c.surface,alignItems:'center',justifyContent:'center',transform:[{scale:badgePop}]}}><Txt style={{color:c.onTint,fontSize:11,lineHeight:14,fontWeight:'800',textAlign:'center'}}>{badge}</Txt></Animated.View>}
  </Animated.View>
  <Txt numberOfLines={1} style={{fontSize:12,lineHeight:16,fontWeight:focused?'700':'500',color:focused?c.tint:c.muted,textAlign:'center'}}>{label}</Txt>
 </Pressable>;
}
