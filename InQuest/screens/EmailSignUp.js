import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Button,ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";


export default function EmailSignUp({navigation}){
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [reenterPassword, setReenterPassword] = useState('');

    const handleSignUp = () => {
        if(password !== reenterPassword){
            alert("Passwords do not match");
            return;
        }
        createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
        .then(async(userCredentials) => {
            const user = userCredentials.user; 
            console.log('Signed up with: ', user.email);

            //Save username to Firestore 
            await setDoc(doc(FIRESTORE_DB, "users", user.uid), {
                email: user.email, 
                username: username,
            });
            //Navigate to Homepage
            navigation.navigate('MainTabs');
        }).catch(error => alert(error.message))
    }


    return(
        <KeyboardAvoidingView 
            style={styles.container}
            behavior="padding"
        >
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Email"
                    placeholderTextColor='#93B1A6'
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Username"
                    placeholderTextColor='#93B1A6'
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor='#93B1A6'
                    autoCapitalize="none"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Re-enter Password"
                    placeholderTextColor='#93B1A6'
                    secureTextEntry={true}
                    value={reenterPassword}
                    onChangeText={setReenterPassword}
                    style={styles.input}
                />
                {/* <Button title="Create Account" onPress={handleSignUp}/> */}
                {/* <Button title="Create Account"/> */}
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handleSignUp}
                    style = {styles.createButton}
                >
                    <Text>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}




const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    //   backgroundColor: '#040D12',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 150,
        marginTop: 150,
        color: '#93B1A6',
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: '#93B1A6',
        borderWidth: 1,
        backgroundColor: '#183D3D',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignSelf: 'center',
        color: 'white'
    },
    createButton: {
        backgroundColor: '#5C8374', // Change this to your desired button color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20, // Rounded corners
        alignSelf: 'flex-end', // Align to the right
        marginRight: 37
    },
    // createButtonText:{
    //     color: 'white',
    //     fontSize: 16,
    //     fontWeight: 'bold',
    // }
});