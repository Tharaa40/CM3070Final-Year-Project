import React ,{ useState } from "react";
import { View, StyleSheet, Alert, Switch } from "react-native";
import { Button, useTheme, Text, TextInput } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";

import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { signInWithEmailAndPassword,sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, where, query } from "firebase/firestore";

export default function Login (){
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(false);
    const [emailForReset, setEmailForReset] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);

    const navigation = useNavigation();
    const theme = useTheme();


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
            navigation.navigate('HomeTab');
        }catch(error){
            Alert.alert("Login Error", error.message);
        }
    };

    const handlePasswordReset = async() => {
        try{
            await sendPasswordResetEmail(FIREBASE_AUTH, emailForReset);
            Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
            setShowResetModal(false);
        }catch(error){
            Alert.alert('Error', error.message);
        }
    }
    
    
    
    return(
        <View style={[styles.container, {backgroundColor:theme.colors.background}]}>
            <Text style = {[styles.title, {color: theme.colors.primary}]} > Sign In </Text>  
            <View style={styles.inputContainer}>
                <TextInput
                    mode="outlined"
                    style={styles.input}
                    label={username ? "Username" : "Email"}
                    contentStyle={{fontFamily: 'Lora-Medium'}}
                    value={identifier}
                    onChangeText={text => setIdentifier(text)}
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
                    style={styles.input}
                    label="Password"
                    contentStyle={{fontFamily: 'Lora-Medium'}}
                    value={password}
                    onChangeText={text => setPassword(text)}
                    secureTextEntry
                    outlineColor="#ddd"
                    activeOutlineColor={theme.colors.primary}
                    theme={{
                        roundness: 20,
                        colors:{
                            background: theme.colors.surface
                        }
                    }}
                />
            </View>

            <View style={styles.textContainer}>
                <Text 
                    variant="titleSmall"
                    onPress={() => setShowResetModal(true)}
                    style={[styles.forgetText, {color: theme.colors.textAlt}]}
                >
                    Forgot your password
                </Text>
            </View>


            <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, {color: theme.colors.textAlt}]}>Login with username</Text>
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
                    textColor={theme.colors.primary}
                    labelStyle={{fontFamily: 'Montserrat-Medium', fontSize: 16}}
                >
                    Sign In 
                </Button>

                <Button 
                    mode="outlined"
                    onPress={() => navigation.navigate('EmailSignUp')}
                    textColor={theme.colors.primary}
                    labelStyle={{fontFamily: 'Montserrat-Medium', fontSize: 16}}
                >
                    Sign Up 
                </Button>
            </View>

            {/**Password Reset Modal*/}
            {showResetModal && (
                <View style={[styles.modalContainer, {backgroundColor: theme.colors.surface}]}>
                    <Text style={[ styles.modalTitle, {color: theme.colors.textAlt} ]}>
                        Reset Password 
                    </Text>
                    <TextInput
                        mode="outlined"
                        label="Enter your email"
                        value={emailForReset}
                        onChangeText={setEmailForReset}
                        contentStyle={{fontFamily: 'Roboto-Regular'}}
                        activeUnderlineColor="white"
                        outlineColor={theme.colors.border}
                        style={[ styles.resetInput, {backgroundColor: theme.colors.surfaceAlt} ]}
                    />
                    <Button 
                        onPress={handlePasswordReset} 
                        buttonColor={theme.colors.primary}
                        textColor="white"
                        style={styles.modalButton}
                    > 
                        Send reset Link 
                    </Button>
                    <Button 
                        onPress={() => setShowResetModal(false)} 
                        buttonColor={theme.colors.primaryAlt}
                        textColor="white" 
                        style={styles.modalButton}
                    > 
                        Cancel 
                    </Button>
                </View>
            )}
            

        </View>
  
    );
}

 const styles = StyleSheet.create({
    container: { //the entire screen 
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: { //'Sign In' text 
        fontSize: 30,
        fontFamily: 'PlayfairDisplay-Bold',
        textAlign: 'center',
        marginTop: '50%',
        marginBottom: '20%',
    },
    inputContainer:{ //credentials textinputs
        width: '100%',
        marginBottom: 10,
    },
    input: { //individual text input 
        width: '100%',
        height: 50,
        marginBottom: 10,
        fontSize: 16,
    },

    textContainer:{ //forget password container
        width: '100%',
        marginRight: 30,
        marginTop: -10
    },
    forgetText:{ //forget password text
        textAlign: 'right',
        fontFamily: 'Roboto-Regular'
    },


    switchContainer:{ //label+switch 
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginLeft: '45%'
    },
    switchLabel:{ //label text
        fontFamily: 'Roboto-Regular',
        color: '#333',
        marginRight: 10,
    },
   
    buttonContainer:{
        marginLeft: '67%'
    },
    button:{
        marginBottom: '7%',
    },

    modalContainer: {
        position: 'absolute',
        top: '30%',
        left: '10%',
        right: '10%',
        padding: 20,
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 4, 
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat-Medium', 
        fontWeight: 'bold',
        marginBottom: 15,
    },
    resetInput:{
        marginBottom: 15,

    },
    modalButton:{
        marginBottom: 10, 
        marginHorizontal: '20%'
    },


 });



//  Playfair Display
//  Montserrat
//  Roboto
//  Lora

//  1. Headers/Titles:
//  Font: Playfair Display (Bold)
//  Reason: Adds elegance and prominence to headings, making them stand out.

//  2. Subtitles/Secondary Headers:
//  Font: Lora (Regular or Medium)
//  Reason: Provides a sophisticated look for subtitles, maintaining readability and elegance.

//  3. Body Text:
//  Font: Roboto (Regular)
//  Reason: Ensures clear and legible text for task details and descriptions.

//  4. Buttons/Navigation:
//  Font: Montserrat (Medium or Semi-Bold)
//  Reason: Offers a modern and clean appearance, enhancing usability and visual appeal.

//  5. General UI Text (e.g., form fields, labels):
//  Font: Source Sans Pro (Regular)
//  Reason: Provides readability and a modern look for user interface elements.

