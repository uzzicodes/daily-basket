import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
export default function Symbol({name,size,color}:{name:React.ComponentProps<typeof Ionicons>['name'];size:number;color:string}){return <Ionicons name={name} size={size} color={color} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"/>;}
