import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, StyleSheet, Dimensions } from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from 'react-native-vector-icons';
import { BarChart } from "react-native-chart-kit";
import { ProgressBar } from "react-native-paper";


const screenWidth = Dimensions.get('window').width;

export default function Progress() {
    const navigation = useNavigation(); 

    const [points, setPoints] = useState(0);
    const [xp, setXp] = useState(0);
    const [badges, setBadges] = useState
    (
        {easy: false, medium: false, hard: false}
    );

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


                    

 
                    // const newBadges = {   ////2nd method
                    //     easy: userXp >= 50 || userData.badges?.easy,
                    //     medium: userXp >= 100 || userData.badges?.medium,
                    //     hard: userXp >= 200 || userData.badges?.hard,
                    // };

                    // if(JSON.stringify(newBadges) !== JSON.stringify(badges)){
                    //     setBadges(newBadges);

                    //     if(JSON.stringify(newBadges) !== JSON.stringify(userData)){
                    //         await updateDoc(userRef, {badges: newBadges});
                    //     }
                    // }

                    // const unlockedBadges = {...badges}; ////1st method 
                    // if (userXp >= 50 && !userData.badges?.easy) {
                    //     unlockedBadges.easy = true;
                    // }
                    // if (userXp >= 100 && !userData.badges?.medium) {
                    //     unlockedBadges.medium = true;
                    // }
                    // if (userXp >= 200 && !userData.badges?.hard) {
                    //     unlockedBadges.hard = true;
                    // }
                    
                    // setBadges(unlockedBadges);

                    // if( unlockedBadges.easy !== userData.badges?.easy ||
                    //     unlockedBadges.medium !== userData.badges?.medium ||
                    //     unlockedBadges.hard !== userData.badges?.hard)
                    // {
                    //     await updateDoc(userRef, { badges: unlockedBadges });
                    // }

                }
            }
        };
        fetchUserData();
    }, [points, xp]);   
    
    return(
        <ScrollView contentContainerStyle={styles.container}>
            <FontAwesome5  name="angle-left" size={30} color='black' onPress={() => navigation.goBack()} />
            <Text style={styles.title}>User Progress</Text>
            <View style={styles.chartContainer}>
                <Text style={styles.label}>Points</Text>
                <ProgressBar
                    progress={points/700}
                    color = "#2196F3" 
                    style={styles.progressBar} 
                />
            </View>
            <View style={styles.chartContainer}>
                <Text style={styles.label}>XP</Text>
                <ProgressBar 
                    progress={xp / 1000} 
                    color="#FF5722" 
                    style={styles.progressBar} 
                />
            </View>
            <View style={styles.badgesContainer}>
                <Text style={styles.label}>Unlocked Badges</Text>
                <View style={styles.badgeRow}>
                    {Array.from({length: badges.easy}).map((_, index) => (
                        <Image key={`easy-${index}`} source={require('../assets/badges/bronze_badge.png')} style={styles.badge}/>
                    ))}
                    {Array.from({length: badges.medium}).map((_, index) => (
                        <Image key={`medium-${index}`} source={require('../assets/badges/silver_badge.png')} style={styles.badge}/>
                    ))}
                    {Array.from({length: badges.hard}).map((_, index) => (
                        <Image key={`hard-${index}`} source={require('../assets/badges/gold_badge.png')} style={styles.badge}/>
                    ))}
                </View>
                {/* <View style={styles.badgeRow}>
                    {badges.easy && <Image source={require('../assets/badges/bronze_badge.png')} style={styles.badge} />}
                    {badges.medium && <Image source={require('../assets/badges/silver_badge.png')} style={styles.badge} />}
                    {badges.hard && <Image source={require('../assets/badges/gold_badge.png')} style={styles.badge} />}
                </View> */}

            </View>
        </ScrollView>
    );


}

const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    barRadius: 8, // Adds rounded corners to the bars
    fillShadowGradient: '#00bfff',
    fillShadowGradientOpacity: 1,

};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: '#f5f5f5',
        margin: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    progressBar:{
        height: 12, 
        borderRadius: 6, 
        marginBottom: 20
    },
    badgesContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 30,
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    badge: {
        width: 60,
        height: 60,
    },
    // chartContainer: {
    //     width: '100%',
    //     marginBottom: 30,
    // },
  
    // chart: {
    //     marginVertical: 8,
    //     borderRadius: 16,
    // },
});







// import { useNavigation } from '@react-navigation/native';
// import React from 'react';
// import { View, Text, Image } from 'react-native';
// import { FontAwesome5 } from 'react-native-vector-icons';

// const PetStatus = ({ points, xp, badges }) => {
//     const navigation = useNavigation();

//     // Determine pet appearance or status based on points and XP
//     // const petImage = xp >= 150 ? 'hard_pet.png' : xp >= 75 ? 'medium_pet.png' : 'easy_pet.png';

//     return (
//         <View style={{ alignItems: 'center', margin: 20 }}>
//             <FontAwesome5  name="angle-left" size={30} color='black' onPress={() => navigation.goBack()} />

//             {/* <Image source={{ uri: petImage }} style={{ width: 100, height: 100 }} /> */}
//             <Text>Points: {points}</Text>
//             <Text>XP: {xp}</Text>
//             {/* <Text>Badges: {badges.join(', ')}</Text> */}
//         </View>
//     );
// };

// export default PetStatus;