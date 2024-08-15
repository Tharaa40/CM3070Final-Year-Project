import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Menu, Appbar } from "react-native-paper";

export default function AvatarMenu ({ menuVisible, handleToggleMenu, handleMenuItemClick }){
    const navigation = useNavigation();
    return(
        <Menu
        visible={menuVisible}
        onDismiss={handleToggleMenu}
        anchor={
                <Appbar.Action
                    icon='dots-vertical'
                    color="black"
                    onPress={handleToggleMenu}
                />
            }
        >
            <Menu.Item
                onPress={() => {
                    console.log("Toggle theme pressed");
                    handleToggleMenu();
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