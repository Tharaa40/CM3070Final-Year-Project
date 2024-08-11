import React ,{ useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Switch } from "react-native";
import { Button } from 'react-native-paper';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, where, query } from "firebase/firestore";


 export default function Login (){
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(false);
    const navigation = useNavigation();

    const handleLogin = async () => {
        try{
            let email = identifier;
            if(username){
                const q = query(collection(FIRESTORE_DB, "users"), where ("username", "==", identifier));
                const querySnapshot = await getDocs(q);
                if(querySnapshot.empty){
                    Alert.alert("Login Error", "No user found with this username.");
                    return;
                }
                const userDoc = querySnapshot.docs[0];
                email = userDoc.data().email;
            }
            //Login using email and password 
            const userCredentials = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = userCredentials.user;
            console.log('Logged in with: ', user.email);
            // navigation.navigate('MainTabs');
            // navigation.navigate('HomePage')
            navigation.navigate('HomeTab');
        }catch(error){
            Alert.alert("Login Error", error.message);
        }
    };
    
    
    
    return(
        <View style={styles.container}>
            <Text style = {styles.title} > Sign In </Text>  
            <View style={styles.inputContainer}>
                <TextInput
                    style = {styles.input}
                    placeholder={username ? "Username" : "Email"}
                    placeholderTextColor= "#93B1A6"
                    value={identifier}
                    onChangeText={text => setIdentifier(text)}
                />
                <TextInput
                    style = {styles.input}
                    placeholder="Password"
                    placeholderTextColor= "#93B1A6"
                    value={password}
                    // onChangeText={setPassword}
                    onChangeText={text => setPassword(text)}
                    secureTextEntry    
                />
            </View>
            <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Login with username</Text>
                <Switch
                    value={username}
                    onValueChange={text => setUsername(text)}
                />
            </View>

            <View style = {styles.buttonContainer}>
                <Button 
                    mode="outlined"
                    onPress={handleLogin}
                    style={styles.button}
                >
                    Sign In 
                </Button>

                <Button 
                    mode="outlined"
                    onPress={() => navigation.navigate('SignUp')}
                >
                    Sign Up 
                </Button>
            </View>
            
            {/* <TouchableOpacity 
                style={styles.signInButton} 
                onPress={handleLogin}
            >
                <Text style={styles.signInButtonText}>Sign In</Text>

            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.signUpButton} 
                onPress={() => navigation.navigate('SignUp')}
            >
                Sign Up logic
                <Text style={styles.signUpButtonText}>Sign Up</Text>

            </TouchableOpacity> */}
        </View>
  
    );
 }

 const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        // justifyContent: 'center',
        paddingHorizontal: 20,
        // backgroundColor: '#040D12'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        // marginBottom: 150,
        // marginTop: 150,
        marginTop: '50%',
        marginBottom: '20%',
        color: '#93B1A6',
    },
    inputContainer:{
        width: '100%',
        marginBottom: 10,
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
    },
    switchContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'flex-end',
        marginBottom: 20,
        marginLeft: '35%'
        // marginVertical: 10,
    },
    switchLabel:{
        fontSize: 16,
        color: '#333',
        marginRight: 10,
    },
    signInButton: {
        width: '30%',
        height: 50,
        backgroundColor: '#007BFF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,


        // backgroundColor: '#5C8374', // Change this to your desired button color
        // paddingVertical: 10,
        // paddingHorizontal: 20,
        // borderRadius: 20, // Rounded corners
        // alignSelf: 'flex-end', // Align to the right
        // marginRight: 37,
        // marginVertical: 5
    },
    buttonContainer:{
        marginLeft: '67%'
    },
    button:{
        marginBottom: '7%'
    },
    signInButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signUpButton:{
        width: '100%',
        height: 50,
        backgroundColor: '#6C757D',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpButtonText:{
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },

 });



