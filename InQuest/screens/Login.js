import React ,{ useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Switch } from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, where, query } from "firebase/firestore";

 export default function Login (){
    // const [email, setEmail] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(false);
    
   
    const navigation = useNavigation();

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, user => {
    //         if(user){
    //             navigation.navigate('MainTabs')
    //         }
    //     })

    //     return unsubscribe;
    // }, []);


    // const handleLogin = () => {
    //     signInWithEmailAndPassword(FIREBASE_AUTH, email, password)
    //     .then(userCredentials => {
    //         const user = userCredentials.user;
    //         console.log('Logged in with: ', user.email);
    //     }).catch(error => alert(error.message))
    // }

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
            navigation.navigate('MainTabs');
        }catch(error){
            Alert.alert("Login Error", error.message);
        }
    };
    
    
    
    return(
        <View style={styles.container}>
            <Text style = {styles.title} > Sign In </Text>  
            <TextInput
                style = {styles.input}
                // placeholder="Email/Username"
                placeholder={username ? "Username" : "Email"}
                placeholderTextColor= "#93B1A6"
                // value={email}
                // onChangeText={text => setEmail(text)}
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
            <View style={styles.switchContainer}>
                <Text>Login with username</Text>
                <Switch
                    value={username}
                    onValueChange={text => setUsername(text)}
                />
            </View>
            
            <TouchableOpacity 
                style={styles.signInButton} 
                onPress={handleLogin}
            >
                <Text style={styles.signInButtonText}>Sign In</Text>

            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.signInButton} 
                onPress={() => navigation.navigate('SignUp')}
            >
                {/* Sign Up logic */}
                <Text style={styles.signInButtonText}>Sign Up</Text>

            </TouchableOpacity>
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
    switchContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    signInButton: {
        backgroundColor: '#5C8374', // Change this to your desired button color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20, // Rounded corners
        alignSelf: 'flex-end', // Align to the right
        marginRight: 37,
        marginVertical: 5
    },
    signInButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

 });



