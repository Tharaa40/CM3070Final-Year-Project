// This is the old settings file 
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { FontAwesome5 } from 'react-native-vector-icons';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider'; 

export default function Settings2() {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [sound, setSound] = useState(null);
    const [musicEnabled, setMusicEnabled] = useState(false);
    const [volume, setVolume] = useState(1.0);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(false);


    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        const loadAndPlayMusic = async() => {
            try{
                const{ sound } = await Audio.Sound.createAsync(
                    require('../assets/badges/lofi.mp3'),
                    {isLooping: true, volume}
                    // {isLooping: true, volume: 1.0}
                );
                setSound(sound);

                if(musicEnabled){
                    await sound.playAsync();
                }
            }catch(error){
                console.error('Error loading or playing sound: ', error);
            }
        };

        if(musicEnabled){
            loadAndPlayMusic();
        }else{
            if(sound){
                sound.unloadAsync();
                setSound(null);
            }
        }

        return() => {
            if(sound) {
                sound.unloadAsync();
            }
        };
    }, [musicEnabled]);

    // Update volume when slider changes
    useEffect(() => {
        if (sound) {
        sound.setVolumeAsync(volume);
        }
    }, [volume, sound]);

    //Function to handle the sound effects toggle 
    const handleSoundEffectsToggle = (value) => {
        setSoundEffectsEnabled(value);
        if(value){
            // Logic to enable sound effects (you can add actual sound effect logic here)
            console.log('Sound Effects Enabled');
        }else{
            //Logic to disable sound effects 
            console.log('Sound Effects Disabled');
        }
    }

    const handleLogout = () => {
        signOut(FIREBASE_AUTH)
        .then(() => {
            navigation.replace("Login")
        }).catch(error => alert(error.message))
    }

    // const handleAvatar = () => {
    //     navigation.navigate('Avatar');
    // }

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
            <View style={styles.header}>
                <Text style={styles.headerTitle}> {`${username}'s Settings`} </Text>
            </View>
            <View style={styles.icon}>
                <FontAwesome5  name="angle-left" size={30} color='white' onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.main}>
                <TouchableOpacity style={styles.textIconContainer} onPress={pickImage}>
                    <Text style={styles.mainText}> Upload Your Photo </Text>
                    <FontAwesome5 name='user' size={30} color='#183D3D' solid={false} />
                </TouchableOpacity>

                {/**Avatar Display */}
                <View style={styles.avatarCircle}>
                    {selectedAvatar ? (
                        <Image source={{ uri: selectedAvatar }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.placeholderText}>No Avatar Selected</Text>
                    )}
                </View>

                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}>Lofi Beats</Text>
                    <FontAwesome5 name='music' size={30} color='#183D3D' solid={false} />
                    <Switch
                        value={musicEnabled}
                        onValueChange={(value) => setMusicEnabled(value)}
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
                    <Text style={styles.mainText}> Privacy </Text>
                    <FontAwesome5 name='shield-alt' size={30} color='#183D3D' solid={false} />
                </View>

                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> FAQ </Text>
                    <FontAwesome5 name='question-circle' size={30} color='#183D3D' solid={false} />
                </View>
            </View>
            <TouchableOpacity
                style={styles.buttonContainer}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButton}> Logout </Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    // container:{
    //     flex: 1,
    //     // backgroundColor: '#040D12',
    // },
    // header:{
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     borderBottomWidth: 1, 
    //     borderBottomColor: 'white',
    //     padding: 20,
    //     paddingTop: 55,
    //     marginBottom:20,
    //     // backgroundColor: '#040D12',
    // },
    // headerTitle:{
    //     fontSize: 30,
    //     fontWeight: 'bold',
    //     color: '#93B1A6',
    // },
    // icon: {
    //     padding: 20
    // },
    // main:{
    //     flex: 1,
    // },
    // textIconContainer:{
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     marginBottom: 30,
    //     marginLeft: 20
    // },
    // mainText:{
    //     fontSize: 20, 
    //     color: '#93B1A6',
    //     marginRight: 10
    // }, 
    // avatarCircle: {
    //     width: 100,
    //     height: 100,
    //     borderRadius: 50,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     backgroundColor: '#f0f0f0',
    //     marginBottom: 20,
    // },
    // avatarImage: {
    //     width: '100%',
    //     height: '100%',
    //     borderRadius: 50,
    // },
    // sliderContainer: {
    //     marginTop: 10,
    //     alignItems: 'center',
    // },
    // volumeLabel: {
    //     fontSize: 16,
    //     marginBottom: 5,
    // },
    // slider: {
    //     width: '90%',
    //     height: 40,
    // },
    // buttonContainer:{
    //     alignSelf: 'center',
    //     marginBottom: 150,
    //     paddingVertical: 15,
    //     paddingHorizontal: 50,
    //     backgroundColor: '#183D3D', 
    //     borderRadius: 5,
    // },
    // logoutButton:{
    //     fontSize: 18, 
    //     color: 'white',
    //     fontWeight: 'bold'
    // },

    container: {
        flex: 1,
        backgroundColor: '#fff',
      },
      header: {
        padding: 20,
        backgroundColor: '#183D3D',
      },
      headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
      },
      icon: {
        position: 'absolute',
        top: 20,
        left: 20,
      },
      main: {
        padding: 20,
      },
      textIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
      },
      mainText: {
        fontSize: 18,
      },
      avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
      },
      avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
      },
    placeholderText: {
        fontSize: 16,
        color: '#888',
    },
    sliderContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    volumeLabel: {
        fontSize: 16,
        marginBottom: 5,
    },
    slider: {
        width: '90%',
        height: 40,
    },
    buttonContainer: {
        padding: 10,
        backgroundColor: '#ff3333',
        marginTop: 20,
        borderRadius: 5,
    },
    logoutButton: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
    
});