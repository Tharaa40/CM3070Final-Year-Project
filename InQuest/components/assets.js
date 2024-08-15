import React from "react";
import { Image } from "react-native";
import { useAssets } from "expo-asset";

export default function MyAssets() {
    const [assets] = useAssets([require('../assets/SproutsLand/Characters/BasicCharakterActions.png')])

    if(!assets) return null;

    return <Image source={assets[0]} style={{ width: 100, height: 100 }}/>
    
}