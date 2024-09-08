import { useNavigation } from "@react-navigation/native";
import React, { useContext, useRef } from "react";
import { Menu, Appbar, useTheme } from "react-native-paper";
import { Animated } from "react-native";

export default function AvatarMenu ({ menuVisible, handleToggleMenu, toggleTheme }){
    const navigation = useNavigation();
    const rotation = useRef(new Animated.Value(0)).current;
    const theme = useTheme();


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

    return(
        <Menu
            visible={menuVisible}
            onDismiss={handleToggleMenu}
            anchor={
                <Animated.View style={{ transform: [{ rotate }] }}>
                    <Appbar.Action
                        icon='dots-vertical'
                        color={theme.colors.primaryAlt}
                        onPress={handlePress}
                    />
                </Animated.View>
            }
            style={{ marginTop: 60 }}
        >
            <Menu.Item
                onPress={() => {
                    console.log("Toggle theme pressed");
                    handleToggleMenu();
                    toggleTheme();
                }}
                title='Toggle theme'
                titleStyle= {{ fontFamily: 'Lora-Medium', color: theme.colors.textAlt }}
                leadingIcon='theme-light-dark'
            />
            <Menu.Item
                onPress={() => {
                    handleToggleMenu();
                    navigation.navigate('Settings');
                }}
                title='Settings'
                titleStyle= {{ fontFamily: 'Lora-Medium', color: theme.colors.textAlt  }}
                leadingIcon='cog-outline'
            />
            <Menu.Item
                onPress={() => navigation.navigate('Progress')}
                title = 'Progress'
                titleStyle= {{ fontFamily: 'Lora-Medium', color: theme.colors.textAlt  }}
                leadingIcon='loading'
            />


        </Menu>
    );
}