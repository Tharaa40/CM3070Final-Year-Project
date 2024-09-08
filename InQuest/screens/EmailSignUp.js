import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useTheme, Text, Button, TextInput } from "react-native-paper";
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.titleContainer}>
                <Text style={[styles.title, {color: theme.colors.primary} ]}> InQuest </Text>
            </TouchableOpacity >

            <View style={styles.inputContainer}>
                <TextInput
                    mode="outlined"
                    label="Email"
                    style={styles.input}
                    contentStyle={{fontFamily: 'Lora-Medium'}}
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    outlineColor="#ddd"
                    activeOutlineColor={theme.colors.primary}
                    theme={{
                        roundness: 20, 
                        colors: {
                            background: theme.colors.surface,
                        },
                    }}
                />
                <TextInput
                    mode="outlined"
                    label="Username"
                    style={styles.input}
                    contentStyle={{fontFamily: 'Lora-Medium'}}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                    outlineColor="#ddd"
                    activeOutlineColor={theme.colors.primary}
                    theme={{
                        roundness: 20, 
                        colors: {
                            background: theme.colors.surface,
                        },
                    }}
                />
                <TextInput
                    mode="outlined"
                    label="Password"
                    style={styles.input}
                    contentStyle={{fontFamily: 'Lora-Medium'}}
                    autoCapitalize="none"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                    outlineColor="#ddd"
                    activeOutlineColor={theme.colors.primary}
                    theme={{
                        roundness: 20, 
                        colors: {
                            background: theme.colors.surface,
                        },
                    }}
                />
                <TextInput
                    mode="outlined"
                    label="Re-enter Password"
                    style={styles.input}
                    contentStyle={{fontFamily: 'Lora-Medium'}}
                    secureTextEntry={true}
                    value={reenterPassword}
                    onChangeText={setReenterPassword}
                    outlineColor="#ddd"
                    activeOutlineColor={theme.colors.primary}
                    theme={{
                        roundness: 20, 
                        colors: {
                            background: theme.colors.surface,
                        },
                    }}
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button 
                    mode="elevated"
                    onPress={handleSignUp}
                    labelStyle={{ fontFamily: 'Montserrat-Medium', fontSize: 16}}
                    textColor={theme.colors.primary}
                > 
                    Create Account 
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
};




const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    titleContainer:{
        position: 'absolute',
        top: '15%',
    },
    title: {
        fontSize: 30,
        fontFamily: 'PlayfairDisplay-Bold',
        textAlign: 'center',
        marginTop: '20%',
        marginBottom: '20%',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 30,
    },
    input: {
        width: '100%',
        height: 50,
        marginBottom: 10,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
});