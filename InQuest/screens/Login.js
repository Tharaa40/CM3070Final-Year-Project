import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";

 export default function Login (){
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    return(
        <View style={styles.container}>
            <Text style = {styles.title} > Sign In </Text>  
            <TextInput
                style = {styles.input}
                placeholder="Email/Username"
                placeholderTextColor= "#93B1A6"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style = {styles.input}
                placeholder="Password"
                placeholderTextColor= "#93B1A6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry    
            />
            {/* <Button
                title="Sign In"
                onPress={() => {
                    //Sign-In logic 
                }}
            /> */}
            <TouchableOpacity style={styles.signInButton} onPress={() => {
                //Sign In Logic
            }}>
                <Text style={styles.signInButtonText}>Sign In</Text>

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
        backgroundColor: '#040D12'
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
      },
      signInButton: {
        backgroundColor: '#5C8374', // Change this to your desired button color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20, // Rounded corners
        alignSelf: 'flex-end', // Align to the right
        marginRight: 37
      },
      signInButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
      },

 });



