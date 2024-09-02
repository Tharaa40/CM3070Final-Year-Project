import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, Alert, View, Animated, Text } from "react-native";
import { Appbar, Avatar, useTheme } from 'react-native-paper';
import AvatarMenu from "./AvatarMenu";
import AvatarImg from '../assets/assetsPack/char_walk_left.gif';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { doc, getDoc, onSnapshot} from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';


export default function Header({ username, menuVisible, handleToggleMenu, handleMenuItemClick, toggleTheme }){
    const [points, setPoints] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const flipAnim = useRef(new Animated.Value(0)).current;
    const user = FIREBASE_AUTH.currentUser; 
    const theme = useTheme();

    // useEffect(() => {
    //     const fetchUserData = async() => {
    //         const user = FIREBASE_AUTH.currentUser;
    //         if(user) {
    //             const userRef = doc(FIRESTORE_DB, 'users', user.uid);
    //             const userDoc = await getDoc(userRef);

    //             if(userDoc.exists()){
    //                 const userData = userDoc.data();
    //                 const userPoints = userData.points || 0;
    //                 setPoints(userPoints);
    //             }
    //         }
    //     };
    //     fetchUserData();
    // }, [user]);  
    
    useEffect(() => {
        let unsubscribe;
        if (user) {
            const userRef = doc(FIRESTORE_DB, 'users', user.uid);

            // Listen to real-time updates
            unsubscribe = onSnapshot(userRef, (doc) => {
                if (doc.exists()) {
                    const userData = doc.data();
                    const userPoints = userData.points || 0;
                    setPoints(userPoints);
                }
            });
        }

        // Clean up the listener when the component unmounts
        return () => unsubscribe && unsubscribe();
    }, [user]);

    const flipCard = () => {
        if (isFlipped) {
            Animated.spring(flipAnim, {
                toValue: 0,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(flipAnim, {
                toValue: 1,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
        }
        setIsFlipped(!isFlipped);
    };

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg']
    });

    const frontAnimatedStyle = {
        transform: [{ rotateY: frontInterpolate }]
    };

    const backAnimatedStyle = {
        transform: [{ rotateY: backInterpolate }]
    };

    const icon = <Icon name="heart-outline" size={30}/>
    return(
        // <Appbar.Header style={styles.headerContainer} statusBarHeight={0}>
        //     <Appbar.Content title= {`Hello, ${username}`} />
        //     <Avatar.Image size={50} source={AvatarImg} style={styles.avatar}  />
        //     {/* <TouchableOpacity onPress={handleAvatarClick}>
        //         <Avatar.Image size={50} source={AvatarImg} style={styles.avatar}  />
        //     </TouchableOpacity> */}
        //     <AvatarMenu
        //         menuVisible={menuVisible}
        //         handleToggleMenu={handleToggleMenu}
        //         handleMenuItemClick={handleMenuItemClick}
        //         toggleTheme={toggleTheme}
        //     />                      
        // </Appbar.Header>

        <Appbar.Header style={styles.headerContainer} statusBarHeight={0}>
            <Appbar.Content title={`${username}'s Quest`} color={theme.colors.textAlt} />
            <View>
                <TouchableOpacity onPress={flipCard}>
                    {isFlipped ? (
                        <Animated.View style={[styles.flipCard, backAnimatedStyle, {backgroundColor: theme.colors.surfaceAlt}]}>
                            <View style={styles.pointsContainer}>
                                <Text style={[styles.pointsText, {color: theme.colors.textAlt}]}>{points}</Text>
                                {icon}
                            </View>
                        </Animated.View>
                    ) : (
                        <Animated.View style={[styles.flipCard, frontAnimatedStyle, {backgroundColor: theme.colors.surface}]}>
                            <Avatar.Image size={50} source={AvatarImg} style={[styles.avatar, {borderColor: theme.colors.border}]} />
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
        borderRadius: 10, // Rounded corners for a smoother look
        paddingHorizontal: 5,
        // padding: 10, // Optional: add padding inside the card
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pointsText: {
        fontSize: 18,
        textAlign: 'center',
    },
});
