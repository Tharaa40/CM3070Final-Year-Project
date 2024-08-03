import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from 'react-native-vector-icons';


export default function Avatar() {
    const [selectedImage, setSelectedImage] = useState(null);

    const pickImage = async() => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            allowsEditing: true,
            aspect: [4,3],
            quality: 1,
        });
        if(!result.canceled){
            setSelectedImage(result.uri);
        }
    };
    return(
        <View style={styles.container}>
            {/**User Avatar */}
            <TouchableOpacity onPress={pickImage}>
                <View style={styles.avatarContainer}>
                    {selectedImage ? (
                        <Image source={{uri: selectedImage}} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}> Upload </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/**Rectangles with various images */}
            <View style={styles.rectanglesContainer}>
                <Image/>
                {/**Add locked state images */}
                <View style={styles.lockedImageContainer}>
                    <Image/>
                    <FontAwesome5 name='lock' size={20} color='white' solid={false} style={styles.lockedText}/>
                    {/* <Text style={styles.lockedText}> Locked </Text> */}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
    },
    rectanglesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    rectangleImage: {
        width: 80,
        height: 80,
        margin: 5,
        borderRadius: 5,
        backgroundColor: 'red'
    },
    lockedImageContainer: {
        position: 'relative',
        width: 80,
        height: 80,
        margin: 5,
        backgroundColor: 'red'
    },
    lockedText: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 2,
        borderRadius: 3,
    },
});


