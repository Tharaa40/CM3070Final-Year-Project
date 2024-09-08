import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Image } from 'react-native';
import { FontAwesome5 } from 'react-native-vector-icons';
import { Appbar, Avatar, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig"; 
import { signOut } from 'firebase/auth';
import { Audio } from "expo-av";
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider'; 
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { MusicContext } from '../components/MusicContext';



export default function Settings(){
    const navigation = useNavigation();
    const theme = useTheme();
    const [username, setUsername] = useState('User'); 
    // const [selectedAvatar, setSelectedAvatar] = useState(null);
    const {musicEnabled, setMusicEnabled, volume, setVolume, soundEffectsEnabled, setSoundEffectsEnabled} = useContext(MusicContext);
    // const [backgroundSound, setBackgroundSound] = useState(null);
    // const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(false);
    // const [musicEnabled, setMusicEnabled] = useState(false);
    // const [volume, setVolume] = useState(1.0);
    const [soundEffect, setSoundEffect] = useState(null);     
    const user = FIREBASE_AUTH.currentUser;


    useEffect(() => {
        fetchUserData();
        loadSettingsFromFirestore();
    }, []);
 
    const loadSettingsFromFirestore = useCallback(async() => {
        if(user){
            const docRef = doc(FIRESTORE_DB, 'userSettings', user.uid);
            try{
                const docSnap = await getDoc(docRef);
                if(docSnap.exists()){
                    const settings = docSnap.data();
                    setMusicEnabled(settings.musicEnabled || false);
                    setSoundEffectsEnabled(settings.soundEffectsEnabled || false);
                }else{
                    console.log('No settings found');
                    await setDoc(docRef, {
                        musicEnabled: false, 
                        soundEffectsEnabled: false
                    });
                }
            }catch(error){
                console.error('Error loading settings:', error);
            }
        }
    }, [user]);

    const saveSettingsToFirestore = async () => {
        if (user) {
            const docRef = doc(FIRESTORE_DB, 'userSettings', user.uid);
            try {
                await updateDoc(docRef, {
                    musicEnabled,
                    soundEffectsEnabled,
                });
            } catch (error) {
                console.error('Error saving settings:', error);
            }
        }
    };

    //Function to handle the sound effects toggle 
    const handleSoundEffectsToggle = (value) => {
        setSoundEffectsEnabled(value);
        // if(value){
        //     playSoundEffect();
        //     // Logic to enable sound effects (you can add actual sound effect logic here)
        //     // console.log('Sound Effects Enabled');
        // }else{
        //     if(soundEffect){
        //         soundEffect.unloadAsync();
        //         setSoundEffect(null);
        //     }
        //     console.log('Sound Effects Disabled');
        // }
        saveSettingsToFirestore();
    }

    const handleMusicToggle = async(value) => {
        setMusicEnabled(value);
        saveSettingsToFirestore();
    }

   


    //handle sound effects loading and playing 
    const playSoundEffect = async() => {
        if(soundEffectsEnabled) {
            try{
                const {sound} = await Audio.Sound.createAsync(
                    require('../assets/sounds/lofi-orchestra.mp3')
                );
                setSoundEffect(sound);
                await sound.playAsync();
                sound.setOnPlaybackStatusUpdate((status) => {
                    if(status.didJustFinish) {
                        sound.unloadAsync();
                        setSoundEffect(null);
                    }
                });
            }catch(error){
                console.error('Error playing sound effect: ', error);
            }
        }
    };

   


    
    
    

    // useEffect(() => {
    //     const loadAndPlayMusic = async() => {
    //         if(!backgroundSound){
    //             try{
    //                 const{ sound } = await Audio.Sound.createAsync(
    //                     require('../assets/sounds/lofi-study.mp3'),
    //                     {isLooping: true, volume}
    //                 );
    //                 setBackgroundSound(sound);
    
    //                 if(musicEnabled){
    //                     await sound.playAsync();
    //                 }
    //             }catch(error){
    //                 console.error('Error loading or playing sound: ', error);
    //             }
    //         } else if(musicEnabled){
    //             await backgroundSound.playAsync();
    //         }
    //     };

    //     //Function to stop and unload music
    //     const stopAndUnloadMusic = async() => {
    //         if(backgroundSound) {
    //             await backgroundSound.stopAsync();
    //             await backgroundSound.unloadAsync();
    //             setBackgroundSound(null);
    //         }
    //     };

    //     //control music playback based on toggle state
    //     if(musicEnabled){
    //         loadAndPlayMusic();
    //     }else{
    //         stopAndUnloadMusic();
    //         // if(backgroundSound){
    //         //     backgroundSound.unloadAsync();
    //         //     setBackgroundSound(null);
    //         // }
    //     }

    //     return() => {
    //         if(backgroundSound) {
    //             backgroundSound.unloadAsync();
    //         }
    //     };
    // }, [musicEnabled, volume, backgroundSound]);


    // // Update volume when slider changes
    // useEffect(() => {
    //     if (backgroundSound) {
    //         backgroundSound.setVolumeAsync(volume);
    //     }
    // }, [volume, backgroundSound]);

    const handleLogout = () => {
        signOut(FIREBASE_AUTH)
            .then(() => {
            navigation.replace('Login');
            })
            .catch(error => alert(error.message));
    };

    const fetchUserData = async () => {
        const user = FIREBASE_AUTH.currentUser;
        if(user){
            const userDoc = await getDoc(doc(FIRESTORE_DB, "users", user.uid));
            if(userDoc.exists()){
                const userData = userDoc.data();
                setUsername(userData.username);
            }
        }
    };

    //Image picker 
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            const uri = result.assets[0].uri;
            console.log('Picked image URI:', uri); // Debug
            await uploadAvatar(uri);
        }
    };

    

    

   
    return(
        <View style={styles.container}>
            <Appbar.Header style={styles.headerContainer} statusBarHeight={0}>
                <Appbar.Content title = {`${username}'s Settings`} color={theme.colors.textAlt} />
                <FontAwesome5  name="angle-left" size={30} color='black' onPress={() => navigation.goBack()} />
            </Appbar.Header>
            <View style={styles.mainContentCont}>
                {/**Profile Display */}
                <View style={styles.profileUpload}>
                    <TouchableOpacity style={styles.textIconContainer} onPress={pickImage}>
                        <Text style={styles.mainText}> Upload Your Photo </Text>
                        <FontAwesome5 name='user' size={30} color='#183D3D' solid={false} />
                    </TouchableOpacity>
                </View>

                {/**Lofi Beats */}
                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}>Lofi Beats</Text>
                    <FontAwesome5 name='music' size={30} color='#183D3D' solid={false} />
                    <Switch
                        value={musicEnabled}
                        onValueChange={handleMusicToggle}
                        // onValueChange={(value) => setMusicEnabled(value)}
                    />
                </View>

                {/**Volume Slider */}
                {musicEnabled && (
                    <View style={styles.sliderContainer}>
                        <Text style={styles.volumeLabel}>Volume</Text>
                        <Slider
                            style={{ width: 300, height: 40 }}
                            minimumValue={0}
                            maximumValue={1}
                            value={volume}
                            onValueChange={setVolume}
                            minimumTrackTintColor="#183D3D"
                            maximumTrackTintColor="#000000"
                            thumbTintColor="#183D3D"
                        />
                    </View>
                )}

                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> Sound Effects </Text>
                    <FontAwesome5 name='volume-up' size={30} color='#183D3D' solid={false} />
                    <Switch
                        value={soundEffectsEnabled}
                        onValueChange={handleSoundEffectsToggle}
                    />
                </View>

                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> Account Settings </Text>
                    
                </View>

                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> About app </Text>
                    
                </View>
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        backgroundColor: '#183D3D',
    },
    mainContentCont: {
        padding: 20,
    },
    profileUpload: {
        alignItems: 'center',
        marginBottom: 20,
    },
    textIconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    mainText: {
        fontSize: 18,
        color: '#183D3D',
    },
    sliderContainer: {
        marginVertical: 10,
        alignItems: 'center',
    },
    volumeLabel: {
        marginBottom: 5,
        fontSize: 16,
        color: '#183D3D',
    },

})