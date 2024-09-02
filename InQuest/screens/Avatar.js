// import React, { useState, useEffect } from "react";
// import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
// import * as ImagePicker from 'expo-image-picker';
// import { FontAwesome5 } from 'react-native-vector-icons';
// import { createAvatar } from '@dicebear/core';
// import * as collection from '@dicebear/collection';
// import { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_STORAGE, FIRESTORE_DB } from "../firebaseConfig";
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { doc, setDoc } from "firebase/firestore";
// import { SvgXml } from 'react-native-svg';



// export default function Avatar() {
//     const [selectedImage, setSelectedImage] = useState(null);

//     const pickImage = async() => {
//         let result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images, 
//             allowsEditing: true,
//             aspect: [4,3],
//             quality: 1,
//         });
//         if(!result.canceled){
//             setSelectedImage(result.uri);
//         }
//     };
//     return(
//         <View style={styles.container}>
//             {/**User Avatar */}
//             <TouchableOpacity onPress={pickImage}>
//                 <View style={styles.avatarContainer}>
//                     {selectedImage ? (
//                         <Image source={{uri: selectedImage}} style={styles.avatarImage} />
//                     ) : (
//                         <View style={styles.avatarPlaceholder}>
//                             <Text style={styles.avatarText}> Upload </Text>
//                         </View>
//                     )}
//                 </View>
//             </TouchableOpacity>

//             {/**Rectangles with various images */}
//             <View style={styles.rectanglesContainer}>
//                 <Image/>
//                 {/**Add locked state images */}
//                 <View style={styles.lockedImageContainer}>
//                     <Image/>
//                     <FontAwesome5 name='lock' size={20} color='white' solid={false} style={styles.lockedText}/>
//                     {/* <Text style={styles.lockedText}> Locked </Text> */}
//                 </View>
//             </View>
//         </View>
//     );
// }



// const styles = StyleSheet.create({ //old code
//     container: {
//         padding: 20,
//     },
//     avatarContainer: {
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     avatarImage: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//     },
//     avatarPlaceholder: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         backgroundColor: '#ccc',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     avatarText: {
//         color: '#fff',
//     },
//     rectanglesContainer: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//     },
//     rectangleImage: {
//         width: 80,
//         height: 80,
//         margin: 5,
//         borderRadius: 5,
//         backgroundColor: 'red'
//     },
//     lockedImageContainer: {
//         position: 'relative',
//         width: 80,
//         height: 80,
//         margin: 5,
//         backgroundColor: 'red'
//     },
//     lockedText: {
//         position: 'absolute',
//         bottom: 5,
//         right: 5,
//         color: '#fff',
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         padding: 2,
//         borderRadius: 3,
//     },
// });





import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from 'react-native-vector-icons';
import { createAvatar } from '@dicebear/core';
import * as collection from '@dicebear/collection';
import { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_STORAGE, FIRESTORE_DB } from "../firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from "firebase/firestore";
import { SvgXml } from 'react-native-svg';



export default function Avatar({ navigation }) {
    const [avatars, setAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    // Generate SVG avatars
    const generateAvatarSvg = (seed) => {
        const avatar = createAvatar(collection.adventurer, { seed });
        return avatar.toString(); // Returns SVG string
    };

    // Load avatars on component mount
    useEffect(() => {
        const avatarSeeds = ['seed1', 'seed2', 'seed3', 'seed4', 'seed5'];
        const avatarSvgs = avatarSeeds.map(seed => generateAvatarSvg(seed));
        setAvatars(avatarSvgs);
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            const uri = result.assets[0].uri;
            console.log('Picked image URI:', uri); // Debug
            await uploadAvatar(uri);
        }
    };

    // Upload avatar to Firebase
    const uploadAvatar = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const avatarRef = ref(FIREBASE_STORAGE, `avatars/${new Date().getTime()}.jpg`);

            await uploadBytes(avatarRef, blob);
            const url = await getDownloadURL(avatarRef);

            const userId = FIREBASE_AUTH.currentUser.uid;
            await setDoc(doc(FIRESTORE_DB, 'users', userId), { avatarURL: url }, { merge: true });

            setSelectedAvatar(url);
            console.log("Avatar uploaded and URL updated in Firestore:", url); // Debug
        } catch (error) {
            console.error('Error uploading avatar:', error);
        }
    };

    const handleAvatarSelect = async (avatar) => {
        try {
            console.log("Avatar selected: ", avatar);
            setSelectedAvatar(avatar);
            const userId = FIREBASE_AUTH.currentUser.uid;
            await setDoc(doc(FIRESTORE_DB, 'users', userId), { avatarURL: avatar }, { merge: true });
        } catch (error) {
            console.error('Error selecting avatar: ', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Choose your Avatar</Text>
            <FontAwesome5 name="angle-left" size={30} color='white' onPress={() => navigation.goBack()} />
            {/**User Avatar */}
            <View style={styles.avatarCircle}>
                {selectedAvatar ? (
                    selectedAvatar.startsWith('data:image/svg+xml') ? (
                        <SvgXml xml={selectedAvatar} style={styles.avatarImage} />
                    ) : (
                        <Image source={{ uri: selectedAvatar }} style={styles.avatarImage} />
                    )
                ) : (
                    <Text style={styles.placeholderText}>No Avatar Selected</Text>
                )}
            </View>
            <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
                <Text style={styles.uploadText}>Upload Your Photo</Text>
            </TouchableOpacity>

            {/**Rectangles with various avatars */}
            <ScrollView contentContainerStyle={styles.avatarContainer}>
                {avatars.length > 0 ? (
                    avatars.map((avatar, index) => (
                        <TouchableOpacity key={index} onPress={() => handleAvatarSelect(avatar)}>
                            <View style={styles.avatarCircle}>
                                <SvgXml xml={avatar} style={styles.avatarImage} />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text>No avatars available</Text>
                )}
            </ScrollView>
        </View>
    );
}



const styles = StyleSheet.create({ //old code
    container: {
        flex: 1,
        margin: 20,
    },
    title:{
        fontSize: 24, 
        marginBottom: 20
    },
    avatarCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#183D3D',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 20,
        alignSelf: 'center', 
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    placeholderText:{
        fontSize: 16, 
        color: 'gray',
    },
    avatarContainer:{
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    uploadButton:{
        marginVertical: 20, 
        padding: 10, 
        backgroundColor: '#183D3D',
        borderRadius: 5, 
        alignItems:'center'
    },
    uploadText:{ 
        color: 'white', 
        fontSize: 16 
    },
    // avatarContainer: {
    //     alignItems: 'center',
    //     marginBottom: 20,
    // },
    // avatarImage: {
    //     width: 100,
    //     height: 100,
    //     borderRadius: 50,
    // },
    // avatarPlaceholder: {
    //     width: 100,
    //     height: 100,
    //     borderRadius: 50,
    //     backgroundColor: '#ccc',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    // },
    // avatarText: {
    //     color: '#fff',
    // },
    // rectanglesContainer: {
    //     flexDirection: 'row',
    //     flexWrap: 'wrap',
    // },
    // rectangleImage: {
    //     width: 80,
    //     height: 80,
    //     margin: 5,
    //     borderRadius: 5,
    //     backgroundColor: 'red'
    // },
    // lockedImageContainer: {
    //     position: 'relative',
    //     width: 80,
    //     height: 80,
    //     margin: 5,
    //     backgroundColor: 'red'
    // },
    // lockedText: {
    //     position: 'absolute',
    //     bottom: 5,
    //     right: 5,
    //     color: '#fff',
    //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
    //     padding: 2,
    //     borderRadius: 3,
    // },
});


