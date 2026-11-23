import {useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,Easing,Platform} from 'react-native';
import * as Haptics from 'expo-haptics';

// Small, quick feedback motion. Everything is skipped when the phone asks for reduced motion;
// until that setting is known, motion stays off so nobody sees an unwanted first animation.
let reduceMotion=true;const listeners=new Set<(value:boolean)=>void>();
const publish=(value:boolean)=>{reduceMotion=value;listeners.forEach(listener=>listener(value));};
void AccessibilityInfo.isReduceMotionEnabled().then(publish).catch(()=>publish(false));
AccessibilityInfo.addEventListener('reduceMotionChanged',publish);
export function useReducedMotion(){const [value,setValue]=useState(reduceMotion);useEffect(()=>{listeners.add(setValue);setValue(reduceMotion);return()=>{listeners.delete(setValue);};},[]);return value;}

export const easeOut=Easing.out(Easing.cubic);

// Press-in shrink with a soft spring back, for buttons and product cards.
export function usePressScale(depth=.97){const reduce=useReducedMotion(),scale=useRef(new Animated.Value(1)).current;const to=(value:number)=>{if(reduce)return;Animated.spring(scale,{toValue:value,speed:40,bounciness:value===1?7:0,useNativeDriver:true}).start();};return {scale,onPressIn:()=>to(depth),onPressOut:()=>to(1)};}

// Fade and rise once when mounted. A delay staggers the first cards on screen.
export function useEntrance({delay=0,distance=12,from=1}:{delay?:number;distance?:number;from?:number}={}){
 const reduce=useReducedMotion(),progress=useRef(new Animated.Value(reduce?1:0)).current;
 useEffect(()=>{if(reduce){progress.setValue(1);return;}const animation=Animated.timing(progress,{toValue:1,duration:240,delay,easing:easeOut,useNativeDriver:true});animation.start();return()=>animation.stop();},[]);
 return {opacity:progress,transform:[{translateY:progress.interpolate({inputRange:[0,1],outputRange:[distance,0]})},{scale:progress.interpolate({inputRange:[0,1],outputRange:[from,1]})}]};
}

// A quick bounce whenever `trigger` changes after the first render (quantities, favourites, totals).
export function usePop(trigger:unknown,peak=1.18,when=true){
 const reduce=useReducedMotion(),scale=useRef(new Animated.Value(1)).current,first=useRef(true);
 useEffect(()=>{if(first.current){first.current=false;return;}if(reduce||!when)return;scale.setValue(1);Animated.sequence([Animated.timing(scale,{toValue:peak,duration:90,easing:easeOut,useNativeDriver:true}),Animated.spring(scale,{toValue:1,speed:24,bounciness:10,useNativeDriver:true})]).start();},[trigger]);
 return scale;
}

// A light tap on phones that support it; silent on the web preview and on failure.
export function tap(){if(Platform.OS==='web')return;void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});}
