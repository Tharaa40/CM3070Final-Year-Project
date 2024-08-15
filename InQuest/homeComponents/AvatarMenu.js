import { useNavigation } from "@react-navigation/native";
import React, { useContext, useRef } from "react";
import { Menu, Appbar, useTheme as usePaperTheme } from "react-native-paper";
import { Animated } from "react-native";

export default function AvatarMenu ({ menuVisible, handleToggleMenu }){
    const navigation = useNavigation();
    const rotation = useRef(new Animated.Value(0)).current;


    // Trigger the animation
    const animateIcon = () => {
        Animated.timing(rotation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            // Reset rotation back to 0 for the next animation
            rotation.setValue(0);
        });
    };

    // Rotate the icon when menu button is clicked
    const handlePress = () => {
        animateIcon();
        handleToggleMenu();
    };

    // Create the rotation interpolation
    const rotate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // const theme = useTheme();


    return(
        <Menu
        visible={menuVisible}
        onDismiss={handleToggleMenu}
        anchor={
            <Animated.View style={{ transform: [{ rotate }] }}>
                <Appbar.Action
                    icon='dots-vertical'
                    // color={colors.text}
                    color="black"
                    // onPress={handleToggleMenu}
                    onPress={handlePress}
                />
            </Animated.View>
        }
        style={{ marginTop: 60 }}
        // anchor={
        //         <Appbar.Action
        //             icon='dots-vertical'
        //             color="black"
        //             onPress={handleToggleMenu}
        //         />
        //     }
        >
            <Menu.Item
                onPress={() => {
                    console.log("Toggle theme pressed");
                    handleToggleMenu();
                    // toggleTheme();
                }}
                title='Toggle theme'
                leadingIcon='theme-light-dark'
            />
            <Menu.Item
                // onPress={() => navigation.navigate('Settings')}
                onPress={() => {
                    handleToggleMenu();
                    navigation.navigate('Settings');
                }}
                title='Settings'
                leadingIcon='cog-outline'
            />


        </Menu>
    );
}