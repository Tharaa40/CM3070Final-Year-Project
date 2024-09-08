import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { FontAwesome5 } from 'react-native-vector-icons';
import { Appbar, useTheme, Button, Menu, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig"; 
import { signOut } from 'firebase/auth';
// import { Audio } from "expo-av";
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider'; 
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { MusicContext } from '../components/MusicContext';
import moment from "moment";
import * as Notifications from 'expo-notifications';
import { sendPasswordResetEmail } from 'firebase/auth';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';


export default function Settings(){
    const navigation = useNavigation();
    const theme = useTheme();
    const [username, setUsername] = useState('User'); 

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

    const {musicEnabled, setMusicEnabled, volume, setVolume} = useContext(MusicContext);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const user = FIREBASE_AUTH.currentUser;


    useEffect(() => {
        fetchUserData();
        loadSettingsFromFirestore();
        requestNotificationPermission(); //added this 
    }, []);


    const handlePasswordUpdate = async() => {
        if(!user){
            alert('No user is currently signed in');
            return;
        }
        if(newPassword !== confirmNewPassword){
            alert("New passwords do not match");
            return;
        }
        try{
            //Re-authenticate the user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            //Update the password 
            await updatePassword(user, newPassword);
            setPasswordUpdateSuccess(true);
            alert('Password updated successfully');
        }catch(error){
            alert('Error updating password: ' + error.message);
        }
    }

    const requestNotificationPermission = async() => { //added this 
        const { status } = await notificationsEnabled.requestNotificationPermissionAsync();
        if(status !== 'granted'){
            alert('Permission for notification was denied. Please enable it in settings.');
        }
    }
 
    const loadSettingsFromFirestore = useCallback(async() => {
        if(user){
            const docRef = doc(FIRESTORE_DB, 'userSettings', user.uid);
            try{
                const docSnap = await getDoc(docRef);
                if(docSnap.exists()){
                    const settings = docSnap.data();
                    setMusicEnabled(settings.musicEnabled || false);
                    setNotificationsEnabled(settings.notificationsEnabled || true); //added this 
                    if(settings.notificationsEnabled){
                        scheduleDueTodayNotifications();
                    }
                }else{
                    console.log('No settings found');
                    await setDoc(docRef, {
                        musicEnabled: false, 
                        notificationsEnabled: true //added this 
                    });
                }
            }catch(error){
                console.error('Error loading settings:', error);
            }
        }
    }, [user]);

    const scheduleDueTodayNotifications = async() =>{
        if (!user) return;

        try {
            // Fetch user's tasks from Firestore
            const userTasksRef = doc(FIRESTORE_DB, 'tasks', user.uid);
            const userTasksSnap = await getDoc(userTasksRef);
            if (userTasksSnap.exists()) {
                const tasks = userTasksSnap.data().tasks;
    
                // Define today's start and end using moment
                const today = moment().startOf('day');
    
                // Filter tasks that are due today and are not completed
                const dueTodayTasks = tasks.filter(task => {
                    if (task.completed) {
                        return false; // Exclude completed tasks
                    }
    
                    // Parse task deadline using moment, adjust the format as per your task's deadline format
                    const taskDeadline = moment(task.deadline, 'MM/DD/YYYY h:mm A');
                    
                    // Check if the deadline is valid
                    if (!taskDeadline.isValid()) {
                        console.warn(`Invalid task deadline format: ${task.deadline}`);
                        return false;
                    }
    
                    // Return true if the task is due today
                    return taskDeadline.isSame(today, 'day');
                });
    
                // Schedule notifications for tasks due today
                dueTodayTasks.forEach(task => {
                    Notifications.scheduleNotificationAsync({
                        content: {
                            title: 'Task Reminder',
                            body: `You have a task due today: ${task.title}`,
                            sound: true,
                        },
                        trigger: { seconds: 10 }, // Adjust the time before notification triggers
                    });
                });
            }
        } catch (error) {
            console.error('Error scheduling notifications:', error);
        }

    }

    const saveSettingsToFirestore = async () => {
        if (user) {
            const docRef = doc(FIRESTORE_DB, 'userSettings', user.uid);
            try {
                await updateDoc(docRef, {
                    musicEnabled,
                    notificationsEnabled //added this
                });
            } catch (error) {
                console.error('Error saving settings:', error);
            }
        }
    };

    const handleMusicToggle = async(value) => {
        setMusicEnabled(value);
        saveSettingsToFirestore();
    };

    const handleNotificationsToggle = async(value) => { //added this 
        setNotificationsEnabled(value);
        if (value) {
            scheduleDueTodayNotifications();
        }
        saveSettingsToFirestore();
    };

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

                {/**Notifications Toggle */}
                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> Notifications </Text>
                    <FontAwesome5 name='bell' size={30} color="#183D3D" solid={false} />
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={handleNotificationsToggle}
                    />
                </View>

                {/**Password reset section */}
                <View style={styles.passwordUpdateContainer}>
                    <Text style={styles.passwordUpdateText}>Update Password</Text>
                    <TextInput
                        placeholder="Current Password"
                        placeholderTextColor={theme.colors.text}
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="New Password"
                        placeholderTextColor={theme.colors.text}
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Confirm New Password"
                        placeholderTextColor={theme.colors.text}
                        secureTextEntry
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        style={styles.input}
                    />
                    <Button
                        mode="contained"
                        onPress={handlePasswordUpdate}
                        style={styles.updateButton}
                    >
                        Update Password
                    </Button>
                    {passwordUpdateSuccess && <Text style={styles.successMessage}>Password updated successfully.</Text>}
                </View>










                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> Account Settings </Text>
                    
                </View>

                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> About app </Text>
                    
                </View>

                {/**Logout Button */}
                <Button
                    mode='contained'
                    icon='logout'
                    onPress={handleLogout}
                    style={styles.logoutButton}
                >
                    Logout
                </Button>
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     backgroundColor: '#fff',
    // },
    // headerContainer: {
    //     backgroundColor: '#183D3D',
    // },
    // mainContentCont: {
    //     padding: 20,
    // },
    // profileUpload: {
    //     alignItems: 'center',
    //     marginBottom: 20,
    // },
    // textIconContainer: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     alignItems: 'center',
    //     marginVertical: 10,
    // },
    // mainText: {
    //     fontSize: 18,
    //     color: '#183D3D',
    // },
    // sliderContainer: {
    //     marginVertical: 10,
    //     alignItems: 'center',
    // },
    // volumeLabel: {
    //     marginBottom: 5,
    //     fontSize: 16,
    //     color: '#183D3D',
    // },




    container: {
        flex: 1,
    },
    headerContainer: {
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    mainContentCont: {
        padding: 20,
    },
    profileUpload: {
        marginVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    mainText: {
        fontSize: 18,
        color: '#183D3D',
    },
    sliderContainer: {
        marginVertical: 10,
    },
    volumeLabel: {
        fontSize: 16,
        color: '#183D3D',
        marginBottom: 5,
    },
    logoutButton: {
        marginTop: 30,
        backgroundColor: '#ff5252',
    },



    passwordUpdateContainer: {
        marginTop: 20,
    },
    passwordUpdateText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    updateButton: {
        marginTop: 10,
    },
    successMessage: {
        marginTop: 10,
        color: 'green',
    },

});