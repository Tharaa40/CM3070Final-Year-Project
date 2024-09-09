//not using

import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState } from "react";
// import { useNavigation } from "@react-navigation/native";

export default function SignUps({navigation}){
    return(
        <View style={styles.container}>
            <Text style = {styles.title} > InQuest </Text>  
            <TouchableOpacity style = {styles.buttonEmail} onPress={() => navigation.navigate('EmailSignUp')}>
                <Text style={styles.buttonText}>Sign Up with Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style = {styles.buttonGoogle}>
                <Text style={styles.buttonText}>Sign Up with Google</Text>
            </TouchableOpacity>
        </View>
    );
};



const styles = StyleSheet.create({
    container:{
        flex:1, 
        alignItems: 'center',
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
    buttonEmail: {
        backgroundColor: '#5C8374', // Change this to your desired button color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20, // Rounded corners
        marginBottom: 50
    },
    buttonGoogle: {
        backgroundColor: '#183D3D', // Change this to your desired button color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20, // Rounded corners
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});