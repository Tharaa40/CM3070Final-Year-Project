import React, {useState, useEffect, useRef} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { updateDoc, doc } from "firebase/firestore";
import LottieView from 'lottie-react-native';
import DynamicAnimation from './DynamicAnimation';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function VirtualPet({ points, xp, emotion }){
    const [happiness, setHappiness] = useState(50);
    const [hunger, setHunger] = useState(50);
    const [energy, setEnergy] = useState(50);
    const animationRef = useRef(null);

    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [emotionText, setEmotionText] = useState('Happy');
    const [overlayIcon, setOverlayIcon] = useState(null);
    const [animations, setAnimations] = useState([]);

    useEffect(() => { //this is to sync to firebase
        const updatePetData = async() => {
            const user = FIREBASE_AUTH.currentUser;
            if(user){
                const userRef = doc(FIRESTORE_DB, 'users', user.uid);
                await updateDoc(userRef, {
                    petAttributes: {
                        happiness, 
                        hunger, 
                        energy,
                    }
                });
            }
        };
        updatePetData();
    }, [happiness, hunger, energy]);

    useEffect(() => {
        // Update pet attributes based on points and xp
        const newHappiness = Math.min(100, happiness + points / 10);
        const newHunger = Math.max(0, hunger - points / 20);
        const newEnergy = Math.min(100, energy + xp / 50);

        setHappiness(newHappiness);
        setHunger(newHunger);
        setEnergy(newEnergy);
    }, [points, xp]);

    useEffect(() => {
        console.log("Emotion prop:", emotion); 
        if (animationRef.current) {
            switch (emotion) {
                case 'happy':
                    console.log("Happy case triggered");     
                    animationRef.current.play(0, 50);
                    setBackgroundColor('#FFD700');  //yellow
                    setEmotionText('Happy');
                    setAnimations([
                        { source: require('../assets/VirtualPet/bolt.json'), style: { top: 20, left: -50, width: 70, height: 70 } },
                        { source: require('../assets/VirtualPet/bolt.json'), style: { top: 20, left: 180, width: 70, height: 70 } },
                    ]);
                    break;
                case 'sad':
                    console.log("Sad case triggered");     
                    animationRef.current.play(51, 100);
                    setBackgroundColor('#1E90FF)'); //blue
                    setEmotionText('Sad');
                    setAnimations([
                        { source: require('../assets/VirtualPet/rain.json'), style: { top: -50, left: 50, width: 150, height: 150 } }
                    ]);
                    break;
                case 'hungry':
                    console.log("Hungry case triggered");     
                    animationRef.current.play(101, 150);
                    setBackgroundColor('#FF4500'); //red
                    setEmotionText('Hungry'); 
                    setAnimations([
                        { source: require('../assets/VirtualPet/noodles.json'), style: { top: 0, left: -100, width: 180, height: 150  } },
                        { source: require('../assets/VirtualPet/noodles.json'), style: { top: 0, left: 130, width: 180, height: 150  } }
                    ]);
                    break;
                case 'full':
                    console.log("Full case triggered");     
                    animationRef.current.play(151, 200);
                    setBackgroundColor('#32CD32'); //green
                    setEmotionText('Full');
                    setAnimations([
                        { source: require('../assets/VirtualPet/noodles.json'), style: { top: 0, left: -80, width: 180, height: 150  } },
                        { source: require('../assets/VirtualPet/noodles.json'), style: { top: 0, left: 130, width: 180, height: 150  } }
                    ]);
                    break;
                case 'high-energy':
                    console.log("High Energy case triggered");     
                    animationRef.current.play(201, 250);
                    setBackgroundColor('#FF8C00'); //orange
                    setEmotionText('High Energy');
                    setAnimations([
                        { source: require('../assets/VirtualPet/bolt.json'), style: { top: 20, left: -50, width: 70, height: 70 } },
                        { source: require('../assets/VirtualPet/bolt.json'), style: { top: 20, left: 200, width: 70, height: 70 } },
                    ]);
                    break;
                case 'low-energy':
                    animationRef.current.play(251, 300);
                    setBackgroundColor('#A9A9A9'); //gray
                    setEmotionText('Low Energy');
                    setAnimations([
                        { source: require('../assets/VirtualPet/rain.json'), style: { top: -50, left: 50, width: 150, height: 150 } }
                    ]);
                    break;
                default:
                    console.log("Default case triggered");
                    setBackgroundColor('purple');
                    setAnimations([]);
                break;
            }
        }
    }, [emotion]);


    const [selectedIndicator, setSelectedIndicator] = useState(null);

    const happinessOpacity = useSharedValue(0);
    const hungerOpacity = useSharedValue(0);
    const energyOpacity = useSharedValue(0);

    const animatedHappinessStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(happinessOpacity.value, { duration: 500 }),
        };
    });

    const animatedHungerStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(hungerOpacity.value, { duration: 500 }),
        };
    });

    const animatedEnergyStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(energyOpacity.value, { duration: 500 }),
        };
    });

    const handleIconPress = (indicator) => {
        if (selectedIndicator === indicator) {
            // If the same indicator is clicked again, hide the text
            setSelectedIndicator(null);
            happinessOpacity.value = 0;
            hungerOpacity.value = 0;
            energyOpacity.value = 0;
        } else {
            // Otherwise, show the text for the clicked indicator
            setSelectedIndicator(indicator);
            happinessOpacity.value = indicator === 'happiness' ? 1 : 0;
            hungerOpacity.value = indicator === 'hunger' ? 1 : 0;
            energyOpacity.value = indicator === 'energy' ? 1 : 0;
        }
    };




    return (
        <View style={ [styles.container, {backgroundColor} ]}>
            <View style={styles.header}>
                <Text style={styles.title}>Pao Pao</Text>
                <Text style={{ fontFamily: 'Roboto-Regular' }}> is feeling {emotionText} </Text>
            </View>
            <View style={styles.animationContainer}>
                <LottieView
                    ref={animationRef}
                    source={require('../assets/VirtualPet/pandaPopcorn.json')}
                    autoPlay = {false}
                    // loop = {true}
                    style={styles.petAnimation}
                />
                <DynamicAnimation animations={animations} />
            </View>

            <View style={styles.indicatorCont}>
                <View style={styles.iconGroup}>
                    <TouchableOpacity onPress={() => handleIconPress('happiness')}>
                        <View style={styles.circularContainer}>
                            <AnimatedCircularProgress
                                size={70}
                                width={5}
                                // color="white"
                                backgroundColor="white"
                                fill={happiness}
                                // strokeWidth={5}
                                style={styles.circularProgress}
                            />
                            <Icon name="happy-outline" size={27} style={styles.icon}/>
                        </View>
                    </TouchableOpacity>
                    {selectedIndicator == 'happiness' && (
                        <Animated.Text style={[styles.attribute, animatedHappinessStyle]}>
                            Happy: {happiness}
                        </Animated.Text>
                    )}
                </View>

                <View style={styles.iconGroup}>
                    <TouchableOpacity onPress={() => handleIconPress('hunger')}>
                        <View style={styles.circularContainer}>
                            <AnimatedCircularProgress
                                size={70}
                                width={5}
                                color="#FFD700"
                                backgroundColor="red"
                                fill={hunger}
                                strokeWidth={10}
                                style={styles.circularProgress}
                            />
                            <MaterialIcon name="food-apple-outline" size={27} style={styles.icon}/>
                        </View>
                    </TouchableOpacity>
                    {selectedIndicator === 'hunger' && (
                        <Animated.Text style={[styles.attribute, animatedHungerStyle]}>
                            Hunger: {hunger}
                        </Animated.Text>
                    )}
                </View>
                
                <View style={styles.iconGroup}>
                    <TouchableOpacity onPress={() => handleIconPress('energy')}>
                        <View style={styles.circularContainer}>
                            <AnimatedCircularProgress
                                size={70}
                                width={5}
                                color="#FFD700"
                                backgroundColor="#e0e0e0"
                                fill={energy}
                                strokeWidth={10}
                                style={styles.circularProgress}
                            />
                            <Icon name="flash-outline" size={27} style={styles.icon}/>
                        </View>
                    </TouchableOpacity>
                    {selectedIndicator === 'energy' && (
                        <Animated.Text style={[styles.attribute, animatedEnergyStyle]}>
                            Energy: {energy}
                        </Animated.Text>
                    )}
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        borderRadius: 70,
    },
    header:{
        padding: 5,
        marginVertical: 5,
        justifyContent: 'center', 
        textAlign: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        // fontWeight: 'bold',
        fontFamily: 'PlayfairDisplay-Bold' 
    },
    animationContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        height: 200,
        borderRadius: 1,
    },
    petAnimation: {
        alignItems: 'center',
        width: 500,
        height: 400,
    },
    indicatorCont:{
        flexDirection: 'row',
        marginVertical: '8%',
        padding: '2%',
        marginHorizontal: '2%'
    },
    iconGroup:{
        alignItems: 'center',
    },
    circularContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center'
    },
    circularProgress: {
        paddingHorizontal: '9%'
    },
    icon:{
        position: 'absolute',
    },
    attribute: {
        marginTop: 10,
        fontSize: 15,
        fontFamily: 'Lora-Medium',
        // fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },



});
