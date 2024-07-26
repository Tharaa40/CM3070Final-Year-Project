import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";

export default function EmailSignUp(){
    return(
        <View style = {styles.container}>
            <Text style = {styles.title} > InQuest </Text> 
            <TextInput
                style = {styles.input}
                placeholder="Email"
                placeholderTextColor= "#93B1A6"
            /> 
            <TextInput 
                style = {styles.input}
                placeholder="Username"
                placeholderTextColor= "#93B1A6"
            />
            <TextInput 
                style = {styles.input}
                placeholder="Password"
                placeholderTextColor= "#93B1A6"
            />
            <TextInput 
                style = {styles.input}
                placeholder="Re-enter Password"
                placeholderTextColor= "#93B1A6"
            />
            <TouchableOpacity style = {styles.createButton}>
                <Text style={styles.createButtonText}> Create Account </Text>
            </TouchableOpacity>
        </View>
    );
}




const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#040D12',
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
    createButton: {
        backgroundColor: '#5C8374', // Change this to your desired button color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20, // Rounded corners
        alignSelf: 'flex-end', // Align to the right
        marginRight: 37
    },
    createButtonText:{
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});