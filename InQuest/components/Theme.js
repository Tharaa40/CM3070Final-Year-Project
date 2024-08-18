// import React, { createContext, useContext, useState, useMemo } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { customLightTheme, customDarkTheme } from './ThemeColors'; 

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [isDarkTheme, setIsDarkTheme] = useState(false);

//   const toggleTheme = async () => {
//     setIsDarkTheme(!isDarkTheme);
//     await AsyncStorage.setItem('theme', JSON.stringify(!isDarkTheme));
//   };

//   const theme = useMemo(
//     () => (isDarkTheme ? customDarkTheme : customLightTheme),
//     [isDarkTheme]
//   );

//   return (
//     <ThemeContext.Provider value={{ toggleTheme, theme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => useContext(ThemeContext);









// import { NavigationContainer, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme} from '@react-navigation/native';
// import { adaptNavigationTheme,MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
// import merge from 'deepmerge';


// const { LightTheme, DarkTheme } = adaptNavigationTheme({
//     reactNavigationLight: NavigationDefaultTheme,
//     reactNavigationDark: NavigationDarkTheme,
//   });

// export const CombinedDefaultTheme = {
//     ...MD3LightTheme,
//     ...LightTheme,
//     colors: {
//         ...MD3LightTheme.colors,
//         ...LightTheme.colors,
//     },
// };

// export const CombinedDarkTheme = {
//     ...MD3DarkTheme,
//     ...DarkTheme,
//     colors: {
//         ...MD3DarkTheme.colors,
//         ...DarkTheme.colors,
//     },
// };



