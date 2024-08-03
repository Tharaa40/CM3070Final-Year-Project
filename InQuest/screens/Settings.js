import React from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome5 } from 'react-native-vector-icons';
import { FIREBASE_AUTH } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

export default function Settings() {
    const username="John";

    const navigation = useNavigation();

    const handleLogout = () => {
        signOut(FIREBASE_AUTH)
        .then(() => {
            navigation.replace("Login")
        }).catch(error => alert(error.message))
    }

    const handleAvatar = () => {
        navigation.navigate('Avatar');
    }

    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}> {`${username}'s Settings`} </Text>
                <Text> Email: {FIREBASE_AUTH.currentUser?.email} </Text>
            </View>
            <View style={styles.icon}>
                <FontAwesome5  name="angle-left" size={30} color='white' />
            </View>
            <View style={styles.main}>
                <TouchableOpacity style={styles.textIconContainer} onPress={() => handleAvatar}>
                    <Text style={styles.mainText}> Avatar </Text>
                    <FontAwesome5  name='user' size={30} color='#183D3D' solid={false}/>
                </TouchableOpacity>
                
                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> Theme </Text>
                    <FontAwesome5  name='paint-brush' size={30} color='#183D3D' solid={false} />
                </View>
                
                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> Sound </Text>
                    <FontAwesome5  name='music' size={30} color='#183D3D' solid={false}  />
                </View>

                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> Notification </Text>
                    <FontAwesome5  name='bell' size={30} color='#183D3D' solid={false}  />
                </View>

                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> Privacy  </Text>
                    <FontAwesome5  name='shield-alt' size={30} color='#183D3D' solid={false}  />
                </View>

                <View style={styles.textIconContainer}>
                    <Text style={styles.mainText}> FAQ </Text>
                    <FontAwesome5  name='question-circle' size={30} color='#183D3D' solid={false}  />
                </View>
            </View>
            <TouchableOpacity 
                style={styles.buttonContainer}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButton}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        // backgroundColor: '#040D12',
    },
    header:{
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1, 
        borderBottomColor: 'white',
        padding: 20,
        paddingTop: 55,
        marginBottom:20,
        // backgroundColor: '#040D12',
    },
    headerTitle:{
        fontSize: 30,
        fontWeight: 'bold',
        color: '#93B1A6',
    },
    icon: {
        padding: 20
    },
    main:{
        flex: 1,
    },
    textIconContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        marginLeft: 20
    },
    mainText:{
        fontSize: 20, 
        color: '#93B1A6',
        marginRight: 10
    }, 
    buttonContainer:{
        alignSelf: 'center',
        marginBottom: 150,
        paddingVertical: 15,
        paddingHorizontal: 50,
        backgroundColor: '#183D3D', 
        borderRadius: 5,
    },
    logoutButton:{
        fontSize: 18, 
        color: 'white',
        fontWeight: 'bold'
    },
    
});