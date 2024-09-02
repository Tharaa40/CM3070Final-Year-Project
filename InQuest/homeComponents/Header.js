import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, Alert, View, Animated, Text } from "react-native";
import { Appbar, Avatar } from 'react-native-paper';
import AvatarMenu from "./AvatarMenu";
import AvatarImg from '../assets/assetsPack/char_walk_left.gif';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";

export default function Header({ username, menuVisible, handleToggleMenu, handleMenuItemClick, toggleTheme }){
    const [points, setPoints] = useState(0);
    const user = FIREBASE_AUTH.currentUser; 
    const theme = useTheme();

    // useEffect(() => {
        
    // }, []);

    // const fetchUserPoints = async() => {
    //     if(user){
    //         const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', user.uid));
    //         if(userDoc.exists()){
    //             setPoints(userDoc.data().points);
    //         }
    //     }
    // };

    // const handleAvatarClick = () => {
    //     fetchUserPoints();
    //     Alert.alert(`You have ${points} points`)
    // }

    return(
        <Appbar.Header style={styles.headerContainer} statusBarHeight={0}>
            <Appbar.Content title={`Hello, ${username}`} />
            <View>
                <TouchableOpacity onPress={flipCard}>
                    {isFlipped ? (
                        <Animated.View style={[styles.flipCard, backAnimatedStyle]}>
                            <View style={styles.pointsContainer}>
                                <Text style={styles.pointsText}>{points}</Text>
                                {icon}
                            </View>
                        </Animated.View>
                    ) : (
                        <Animated.View style={[styles.flipCard, frontAnimatedStyle]}>
                            <Avatar.Image size={50} source={AvatarImg} style={styles.avatar} />
                        </Animated.View>
                    )}
                </TouchableOpacity>
            </View>
            <AvatarMenu
                menuVisible={menuVisible}
                handleToggleMenu={handleToggleMenu}
                handleMenuItemClick={handleMenuItemClick}
                toggleTheme={toggleTheme}
            />                      
        </Appbar.Header>
    )
}


const styles = StyleSheet.create({
    // headerContainer:{ //using this
    //     // backgroundColor: '#183D3D',
    //     // paddingVertical: 10,
    //     // marginBottom: 20,
    //     // borderBottomWidth: 2,
    //     // borderBottomColor: '#5C8374',
    // },
    // headerContent:{
    //     flexDirection: 'row',
    //     alignItems: 'center',
    // },
    // avatar: {
    //     marginLeft: 10,
    // },

    // flipCard: {
    //     backfaceVisibility: 'hidden',
    // },
    // pointsContainer:{
    //     flexDirection: 'row',
    //     alignItems: 'center'
    // },
    // pointsText: {
    //     fontSize: 18,
    //     color: '#000',
    //     textAlign: 'center',
    //     // padding: 10,
    // },


    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginLeft: 10,
        borderWidth: 1, // Optional: add border for better visibility
    },

    flipCard: {
        backfaceVisibility: 'hidden',
    },
    pointsContainer:{
        flexDirection: 'row',
        alignItems: 'center'
    },
    pointsText: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
        // padding: 10,
    },
});
