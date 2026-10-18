import React,{useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,AppState,ImageBackground,Platform,Pressable,ScrollView,View} from 'react-native';
import {useIsFocused,useNavigation} from '@react-navigation/native';
import {useTheme,campaignTone} from './theme';
import {asset,Icon,Txt,type Nav} from './ui';

const ROTATE_AFTER=6000;

export function BannerCarousel({visible=true}:{visible?:boolean}){
 const {c,t,language}=useTheme(),nav=useNavigation<Nav>(),focused=useIsFocused();
 const scroll=useRef<ScrollView>(null),[page,setPage]=useState(0),[width,setWidth]=useState(320);
 const [paused,setPaused]=useState(false),[hovered,setHovered]=useState(false),[controlFocused,setControlFocused]=useState(false);
 const [reduced,setReduced]=useState(true),[reader,setReader]=useState(Platform.OS!=='web'),[active,setActive]=useState(AppState.currentState==='active');
 const banners=[
  {image:'everyday',title:t('bannerEveryday'),action:t('bannerEverydayAction'),category:undefined},
  {image:'breakfast',title:t('bannerBreakfast'),action:t('bannerBreakfastAction'),category:'Dairy, Milk & Breakfast'},
  {image:'home-care',title:t('bannerHome'),action:t('bannerHomeAction'),category:'Household & Cleaning'},
 ];
 const running=visible&&focused&&active&&!paused&&!hovered&&!controlFocused&&!reduced&&!reader;
 useEffect(()=>{
  let mounted=true;
  void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(mounted)setReduced(value);}).catch(()=>{});
  // React Native Web returns a constant true here; keyboard focus and reduced motion govern web autoplay.
  if(Platform.OS!=='web')void AccessibilityInfo.isScreenReaderEnabled().then(value=>{if(mounted)setReader(value);}).catch(()=>{});
  const motion=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);
  const screenReader=Platform.OS!=='web'?AccessibilityInfo.addEventListener('screenReaderChanged',setReader):null;
  const state=AppState.addEventListener('change',value=>setActive(value==='active'));
  return()=>{mounted=false;motion.remove();screenReader?.remove();state?.remove();};
 },[]);
 function move(index:number,manual=false){
  if(manual)setPaused(true);
  const next=(index+banners.length)%banners.length;
  setPage(next);
  scroll.current?.scrollTo({x:next*width,animated:!reduced});
 }
 useEffect(()=>{
  if(!running)return;
  const timer=setTimeout(()=>move(page+1),ROTATE_AFTER);
  return()=>clearTimeout(timer);
 },[running,page,width]);
 useEffect(()=>{scroll.current?.scrollTo({x:page*width,animated:false});},[width]);
 const focusProps=Platform.OS==='web'?{onFocus:()=>setControlFocused(true),onBlur:()=>setControlFocused(false)}:{};
 return <View onLayout={event=>setWidth(event.nativeEvent.layout.width)} style={{gap:4}}>
  <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={32}
   onScrollBeginDrag={()=>setPaused(true)} onTouchStart={()=>setPaused(true)}
   onMomentumScrollEnd={event=>setPage(Math.max(0,Math.min(banners.length-1,Math.round(event.nativeEvent.contentOffset.x/width))))}>
   {banners.map((banner,index)=><Pressable key={banner.image} accessibilityRole="button"
    accessibilityLabel={banner.title.replace(/\n/g,' ')+' · '+banner.action}
    accessibilityElementsHidden={index!==page} importantForAccessibility={index===page?'auto':'no-hide-descendants'}
    aria-hidden={index!==page} tabIndex={index===page?0:-1} {...focusProps}
    onHoverIn={()=>setHovered(true)} onHoverOut={()=>setHovered(false)}
    onPress={()=>nav.navigate('Catalog',{category:banner.category})}
    style={({pressed})=>({width,borderRadius:16,overflow:'hidden',backgroundColor:campaignTone.background,opacity:pressed?.9:1})}>
    <ImageBackground source={{uri:asset('/images/banners/'+banner.image+'.webp')}} resizeMode="cover" style={{minHeight:194,justifyContent:'center'}}>
     <View style={{width:'60%',minHeight:194,padding:18,gap:16,justifyContent:'space-between',backgroundColor:campaignTone.background}}>
      <Txt style={{fontSize:24,lineHeight:30,fontWeight:'700',letterSpacing:-.5,color:campaignTone.text}}>{banner.title}</Txt>
      <View style={{flexDirection:language==='ur'?'row-reverse':'row',gap:8,alignItems:'center',minHeight:40}}>
       <Txt style={{fontSize:14,lineHeight:20,fontWeight:'700',color:campaignTone.text,flex:1}}>{banner.action}</Txt>
       <View style={{width:28,height:28,borderRadius:14,backgroundColor:campaignTone.text,alignItems:'center',justifyContent:'center'}}><Icon name={language==='ur'?'arrow-back':'arrow-forward'} size={17} color={campaignTone.background}/></View>
      </View>
     </View>
    </ImageBackground>
   </Pressable>)}
  </ScrollView>
  <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
   <View style={{width:48}}/>
   <View accessibilityLabel={t('bannerPages')} style={{flexDirection:'row'}}>{banners.map((banner,index)=><Pressable key={banner.image} accessibilityRole="button"
    accessibilityLabel={t('showBanner')+' '+(index+1)+' / '+banners.length+': '+banner.title.replace(/\n/g,' ')+(index===page?' · '+t('selected'):'')} accessibilityState={{selected:index===page}}
    {...focusProps} onPress={()=>move(index,true)} style={{width:48,height:48,alignItems:'center',justifyContent:'center'}}>
    <View style={{height:5,width:index===page?28:7,borderRadius:4,backgroundColor:index===page?c.tint:c.line}}/>
   </Pressable>)}</View>
   {!reduced&&!reader?<Pressable accessibilityRole="button" accessibilityLabel={paused?t('playBanners'):t('pauseBanners')}
    accessibilityState={{selected:!paused}} {...focusProps} onPress={()=>setPaused(value=>!value)}
    style={({pressed})=>({width:48,height:48,borderRadius:24,alignItems:'center',justifyContent:'center',backgroundColor:pressed?c.soft:'transparent'})}>
    <Icon name={paused?'play-outline':'pause-outline'} size={19} color={c.tint}/>
   </Pressable>:<View style={{width:48}}/>}
  </View>
 </View>;
}
