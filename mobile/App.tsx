import React from 'react';
import {AccessibilityInfo,Platform,useWindowDimensions} from 'react-native';
import {NavigationContainer,DefaultTheme,DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {AppProvider,useApp} from './src/state';
import {useTheme} from './src/theme';
import {Icon,Loading,Notice,Button,Page} from './src/ui';
import {ShopScreen,CategoriesScreen,CatalogScreen,ProductScreen,SearchScreen} from './src/shop';
import {BasketScreen,CheckoutScreen,DeliveryScreen} from './src/checkout';
import {OrdersScreen,OrderScreen,HelpScreen,ListScreen,ListsScreen,ShoppingListScreen,PreferencesScreen} from './src/account';
import type {RootParams} from './src/types';
import {StaffEntryContext} from './src/staff-entry';
import {StaffArea,useStaffSession} from './TeamApp';
import {TabBar} from './src/TabBar';
import {useReducedMotion} from './src/motion';
const Stack=createNativeStackNavigator<RootParams>();
const Tabs=createBottomTabNavigator();
function Main(){const {c,t}=useTheme(),app=useApp(),{width}=useWindowDimensions(),reduce=useReducedMotion(),rail=Platform.OS==='android'&&width>=768;const count=app.cart.reduce((n,l)=>n+l.quantity,0);return <Tabs.Navigator tabBar={rail?undefined:props=><TabBar {...props}/>} screenOptions={{animation:reduce?'none':'shift',headerShown:false,tabBarActiveTintColor:c.tint,tabBarInactiveTintColor:c.muted,tabBarStyle:{backgroundColor:c.surface,borderTopColor:c.line,...(Platform.OS==='web'?{height:68,paddingBottom:8,paddingTop:6}:{})},tabBarLabelStyle:{fontSize:12,fontWeight:'600'},tabBarHideOnKeyboard:true,tabBarPosition:rail?'left':'bottom'}}>
 <Tabs.Screen name="Shop" component={ShopScreen} options={{title:t('shop'),tabBarAccessibilityLabel:t('shop'),tabBarIcon:({color,focused})=><Icon name={focused?'storefront':'storefront-outline'} color={color}/>}}/>
 <Tabs.Screen name="Categories" component={CategoriesScreen} options={{title:t('categories'),tabBarAccessibilityLabel:t('categories'),tabBarIcon:({color,focused})=><Icon name={focused?'grid':'grid-outline'} color={color}/>}}/>
 <Tabs.Screen name="Basket" component={BasketScreen} options={{title:t('basket'),tabBarAccessibilityLabel:t('basket'),tabBarBadge:count?count>99?'99+':count:undefined,tabBarIcon:({color,focused})=><Icon name={focused?'basket':'basket-outline'} color={color}/>}}/>
 <Tabs.Screen name="Orders" component={OrdersScreen} options={{title:t('orders'),tabBarAccessibilityLabel:t('orders'),tabBarIcon:({color,focused})=><Icon name={focused?'receipt':'receipt-outline'} color={color}/>}}/>
 <Tabs.Screen name="Help" component={HelpScreen} options={{title:t('help'),tabBarAccessibilityLabel:t('help'),tabBarIcon:({color,focused})=><Icon name={focused?'chatbubble-ellipses':'chatbubble-ellipses-outline'} color={color}/>}}/>
 </Tabs.Navigator>;}
function Navigation(){const {c,t,dark}=useTheme(),app=useApp();const [reduced,setReduced]=React.useState(false);React.useEffect(()=>{void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);return()=>sub.remove();},[]);const base=dark?DarkTheme:DefaultTheme;if(!app.ready)return <SafeAreaView style={{flex:1,backgroundColor:c.background}}><Loading/></SafeAreaView>;return <><StatusBar style={dark?'light':'dark'}/><NavigationContainer theme={{...base,colors:{...base.colors,primary:c.tint,background:c.background,card:c.surface,text:c.text,border:c.line,notification:c.tint}}}><Stack.Navigator screenOptions={{headerTintColor:c.tint,headerStyle:{backgroundColor:c.surface},headerTitleStyle:{fontSize:18},contentStyle:{backgroundColor:c.background},animation:reduced?'none':Platform.OS==='ios'?'default':'slide_from_right',gestureEnabled:true}}>
 <Stack.Screen name="Main" component={Main} options={{headerShown:false}}/>
 <Stack.Screen name="Search" component={SearchScreen} options={{title:t('searchTitle')}}/>
 <Stack.Screen name="Lists" component={ListsScreen} options={{title:t('lists')}}/>
 <Stack.Screen name="ShoppingList" component={ShoppingListScreen} options={{title:t('lists')}}/>
 <Stack.Screen name="Preferences" component={PreferencesScreen} options={{title:t('settings')}}/>
 <Stack.Screen name="Catalog" component={CatalogScreen} options={{title:t('all')}}/>
 <Stack.Screen name="Product" component={ProductScreen} options={{title:t('shop')}}/>
 <Stack.Screen name="Checkout" component={CheckoutScreen} options={{title:t('checkout')}}/>
 <Stack.Screen name="Delivery" component={DeliveryScreen} options={{title:t('pin'),presentation:'modal',animation:reduced?'none':'slide_from_bottom'}}/>
 <Stack.Screen name="Order" component={OrderScreen} options={{title:t('lastReceipt')}}/>
 <Stack.Screen name="List" component={ListScreen} options={{title:t('sendList')}}/>
 </Stack.Navigator></NavigationContainer></>;}
class ErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<SafeAreaView style={{flex:1}}><Page><Notice text="The app could not open this screen. Your store orders are safe. Close and reopen the app, or contact 0308 4555567." error/><Button title="Try again" onPress={()=>this.setState({failed:false})}/></Page></SafeAreaView>:this.props.children;}}
// One app for everyone: customers shop without an account; a staff sign-in swaps in that person's role screens.
function Root(){const staff=useStaffSession();return <ErrorBoundary>{staff.open?<StaffArea session={staff}/>:<StaffEntryContext.Provider value={staff.show}><Navigation/></StaffEntryContext.Provider>}</ErrorBoundary>;}
export default function App(){return <SafeAreaProvider><AppProvider><Root/></AppProvider></SafeAreaProvider>;}
