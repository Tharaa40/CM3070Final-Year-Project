import React from "react";
import { StyleSheet } from "react-native";
import { Appbar, Avatar } from 'react-native-paper';
import AvatarMenu from "./AvatarMenu";
import AvatarImg from '../assets/assetsPack/char_walk_left.gif';

export default function Header({ username, menuVisible, handleToggleMenu, handleMenuItemClick, toggleTheme }){
    return(
        <Appbar.Header style={styles.headerContainer} statusBarHeight={0}>
            <Appbar.Content title= {`Hello, ${username}`} />
            <Avatar.Image size={50} source={AvatarImg} style={styles.avatar}  />
            <AvatarMenu
                menuVisible={menuVisible}
                handleToggleMenu={handleToggleMenu}
                handleMenuItemClick={handleMenuItemClick}
                toggleTheme={toggleTheme}
            />                      
        </Appbar.Header>
    )
}


const styles = StyleSheet.create({
    headerContainer:{ //using this
        // backgroundColor: '#183D3D',
        // paddingVertical: 10,
        // marginBottom: 20,
        // borderBottomWidth: 2,
        // borderBottomColor: '#5C8374',
    },
    headerContent:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginLeft: 10,
    },
});
