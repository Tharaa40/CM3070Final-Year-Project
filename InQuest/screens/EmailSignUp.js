import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity,ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useTheme, Text as TextA, Button } from "react-native-paper";
import { FontAwesome5 } from 'react-native-vector-icons';
import { doc, setDoc } from "firebase/firestore";


export default function EmailSignUp({navigation}){
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [reenterPassword, setReenterPassword] = useState('');
    const theme = useTheme();

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
            navigation.navigate('HomeTab');
        }).catch(error => alert(error.message))
    }


    return(
        <KeyboardAvoidingView 
            style={[styles.container, {backgroundColor: theme.colors.background}]}
            behavior="padding"
        >
            <FontAwesome5  name="angle-left" size={30} style={[styles.angleLeft, {color: theme.colors.text}]} onPress={() => navigation.goBack()} />

            <View style={styles.nameContainer}>
                <TextA variant="displaySmall" style={{color: theme.colors.primary}}> InQuest </TextA>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Email"
                    placeholderTextColor = {theme.colors.text}
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Username"
                    placeholderTextColor={theme.colors.text}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor={theme.colors.text}
                    autoCapitalize="none"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Re-enter Password"
                    placeholderTextColor={theme.colors.text}
                    secureTextEntry={true}
                    value={reenterPassword}
                    onChangeText={setReenterPassword}
                    style={styles.input}
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button 
                    mode="elevated"
                    onPress={handleSignUp}
                > 
                    Create Account 
                </Button>
            </View>
        </KeyboardAvoidingView>
    )
}




const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    angleLeft:{
        position: 'absolute',
        top:'10%',
        left: '13%'
    },
    nameContainer:{
        position: 'absolute',
        top: '15%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 150,
        marginTop: 150,
        color: '#93B1A6',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 30,
    },
    input: {

        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        marginBottom: 10,
        backgroundColor: '#FFF',
        fontSize: 16,
        color: '#333',


        // width: '80%',
        // height: 40,
        // borderColor: '#93B1A6',
        // borderWidth: 1,
        // backgroundColor: '#183D3D',
        // marginBottom: 20,
        // paddingHorizontal: 10,
        // borderRadius: 5,
        // alignSelf: 'center',
        // color: 'white'


        // paddingHorizontal: 15,
        // paddingVertical: 12,
        // borderRadius: 20,
        // borderColor: '#93B1A6' ,
        // marginTop: 10,
        // fontSize: 16,
        // color: '#FFFFFF',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    createButton: {
        // backgroundColor: '#5C8374', // Change this to your desired button color
        // paddingVertical: 10,
        // paddingHorizontal: 20,
        // borderRadius: 20, // Rounded corners
        // alignSelf: 'flex-end', // Align to the right
        // marginRight: 37


        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    
});