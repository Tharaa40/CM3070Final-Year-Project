import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";

export default function Landing ({navigation}) {
    return(
        <View style={styles.container}>
            <Text style={styles.appName}> InQuest </Text>
            <View style={styles.buttonContainer}>
                <Button 
                    title="Sign In" 
                    style={styles.button}
                    onPress={() => navigation.navigate('Login')}
                />
                <Button 
                    title="Sign Up" 
                    style={styles.button}
                    onPress={() => navigation.navigate('SignUp')}
                />
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex:1, 
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    appName:{
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 150,
        marginTop: 150,
        color: '#93B1A6',
    },
    button:{
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20, // Rounded corners
        alignSelf: 'flex-end', // Align to the right
        marginRight: 37
    }
})
