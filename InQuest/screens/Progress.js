import React, { useState, useEffect } from "react";
import { View, ScrollView, Image, StyleSheet } from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { ProgressBar, Text, useTheme } from "react-native-paper";
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome5 } from 'react-native-vector-icons';
import VirtualPet from '../rewardSystem/VirtualPet';



export default function Progress() {
    const navigation = useNavigation(); 
    const theme = useTheme();

    const [points, setPoints] = useState(0);
    const [xp, setXp] = useState(0);
    const [badges, setBadges] = useState
    (
        {easy: false, medium: false, hard: false}
    );

    const [emotion, setEmotion] = useState('happy');

    useEffect(() => {
        const fetchUserData = async() => {
            const user = FIREBASE_AUTH.currentUser;
            if(user) {
                const userRef = doc(FIRESTORE_DB, 'users', user.uid);
                const userDoc = await getDoc(userRef);

                if(userDoc.exists()){
                    const userData = userDoc.data();
                    const userPoints = userData.points || 0;
                    const userXp = userData.xp || 0;
                    setPoints(userPoints);
                    setXp(userXp);

                    // Retrieve happiness, hunger, and energy
                    const { happiness = 50, hunger = 50, energy = 50 } = userData.petAttributes || {};

                    const easyBadgeCount = Math.floor(userXp/115);
                    const mediumBadgeCount = Math.floor(userXp/230);
                    const hardBadgeCount = Math.floor(userXp/345);

                    const newBadges = {
                        easy: easyBadgeCount, 
                        medium: mediumBadgeCount, 
                        hard: hardBadgeCount,
                    };

                    if(JSON.stringify(newBadges) !== JSON.stringify(badges)){
                        setBadges(newBadges);

                        await updateDoc(userRef, {badges: newBadges});
                        
                    }

                    if(userData.xp < 200) {
                        setEmotion('sad');
                    }else if(userData.xp >= 200 && userData.xp <= 300){
                        setEmotion('happy');
                    }else if(userData.xp >= 300 && userData.xp < 600){
                        if(happiness > 80 || energy > 70){
                            setEmotion('high-energy');
                        }else if(hunger < 30){
                            setEmotion('hungry');
                        }else if(energy  < 30){
                            setEmotion('low-energy');
                        }else if(hunger > 70 && energy > 50){
                            setEmotion('full');
                        }else if(happiness < 30){
                            setEmotion('sad');
                        }else{
                            setEmotion('happy');
                        }
                    }

                }
            }
        };
        fetchUserData();
    }, [points, xp]);   
    // if(emotion == null) return null;
    
    return(
        <ScrollView contentContainerStyle={[styles.container, {backgroundColor: theme.colors.background}]}>
            <View style={styles.header}>
                <FontAwesome5  name="angle-left" size={30} color='black' onPress={() => navigation.goBack()} />
                <Text variant="headlineMedium" style={[styles.title, {color: theme.colors.primary}]}>User Progress</Text>
            </View>

            <View style={styles.petContainer}>
                <VirtualPet points={points} xp={xp} emotion={emotion}/>
            </View>

            <View style={[styles.chartContainer, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}>
                <View style={styles.labelContainer}>
                    <Text variant="headlineSmall" style={{ fontFamily: 'Lora-Medium', color: theme.colors.text }}>Points</Text>
                    <View style={styles.pointXPIcon}>
                        <Text variant="titleMedium" style={{ fontFamily: 'Roboto-Regular' }}> {points} </Text>
                        <Icon name="heart-outline" size={30} />
                    </View>
                </View>
                <ProgressBar
                    progress={points/700}
                    color = "#2196F3" 
                    style={[styles.progressBar, {backgroundColor: theme.colors.background}]} 
                />
            </View>
            <View style={[styles.chartContainer, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}>
                <View style={styles.labelContainer}>
                    <Text variant="headlineSmall" style={{ fontFamily: 'Lora-Medium' }}>XP</Text>
                    <View style={styles.pointXPIcon}>
                        <Text variant="titleMedium" style={{ fontFamily: 'Roboto-Regular' }}> {xp} </Text>
                        <Icon name="diamond-outline" size={30} />
                    </View>
                </View>
                <ProgressBar 
                    progress={xp / 1000} 
                    color="#FF5722" 
                    style={[styles.progressBar, {backgroundColor: theme.colors.primary}]} 
                />
            </View>

            <View style={styles.badgesContainer}>
                <Text variant="headlineSmall" style={[styles.label, {color: theme.colors.textAlt}]}>Unlocked Badges</Text>
                <View style={styles.badgeRow}>
                    <View style={styles.badgeTextCont}>
                        <Text variant="titleLarge" style={[styles.badgeLabel, {color: theme.colors.textAlt}]}> Bronze </Text>
                        <View style={styles.badgeCont}>
                            {Array.from({length: badges.easy}).map((_, index) => (
                                <Image key={`easy-${index}`} source={require('../assets/badges/pumpkin.png')} style={styles.badge}/>
                            ))}
                        </View>
                    </View>
                   
                   <View style={styles.badgeTextCont}>
                        <Text variant="titleLarge" style={[styles.badgeLabel, {color: theme.colors.textAlt}]}> Silver </Text>
                        <View style={styles.badgeCont}>
                            {Array.from({length: badges.medium}).map((_, index) => (
                                <Image key={`medium-${index}`} source={require('../assets/badges/leaves.png')} style={styles.badge} />
                            ))}
                        </View>
                    </View>

                    <View style={styles.badgeTextCont}>
                        <Text variant="titleLarge" style={[styles.badgeLabel, {color: theme.colors.textAlt}]}> Gold </Text>
                        <View style={styles.badgeCont}>
                            {Array.from({length: badges.hard}).map((_, index) => (
                                <Image key={`hard-${index}`} source={require('../assets/badges/bamboo.png')} style={styles.badge}/>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );


}



const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        // backgroundColor: '#f5f5f5',
        marginVertical: 7,
        marginHorizontal: 7,
        paddingBottom: '20%',
    },
    header:{
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent:'center',
        height: 60,
        position: 'relative',
        marginBottom: 15,
    },
    backArrow:{
        position: 'absolute', 
        left: 10
    },
    title: {
        flex: 1, 
        textAlign: 'center', 
        fontFamily: 'PlayfairDisplay-Bold'
    },


    chartContainer: {
        marginVertical: 10,
        // backgroundColor: 'lightgreen',
        paddingHorizontal: 10,
        borderRadius: 10, 
        padding: 10,
        // width: '100%',
        // marginBottom: 30,
    },
    labelContainer:{
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    pointXPIcon:{
        flexDirection: 'row',
        alignItems: 'center', 
    },
    progressBar:{
        height: 12, 
        borderRadius: 6, 
        marginBottom: 20
    },

    badgesContainer:{
        // backgroundColor: 'yellow', 
        // padding: 12,
    }, 
    label: {
        textAlign: 'center', 
        fontFamily: 'Lora-Medium',
        // backgroundColor: 'red', 
        marginBottom: 15
    },
    badgeRow:{
        flexDirection: 'column',
    }, 
    badgeTextCont: {
        marginBottom: 10,
        // backgroundColor: 'orange',
        paddingHorizontal: 5,
        paddingVertical: 5,
    },
    badgeLabel:{
        // fontSize: 16,
        // fontWeight: 'semibold',
        fontFamily: 'Montserrat-Medium',
        marginBottom: 5,
    },
    badgeCont: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    badge: {
        width: 40,
        height: 40,
        marginRight: 5,
        marginBottom: 5,
    },

  
});






