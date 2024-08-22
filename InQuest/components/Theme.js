import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import merge from 'deepmerge';

// const CustomLightTheme = {
//   ...MD3LightTheme,
//   colors: {
//     ...MD3LightTheme.colors,
//     primary: '#6200ee',
//     background: 'grey',
//     surface: '#f2f2f2',
//     text: '#000000',
//     // Add any other colors you want to customize
//   },
// };

// const CustomDarkTheme = {
//   ...MD3DarkTheme,
//   colors: {
//     ...MD3DarkTheme.colors,
//     primary: '#bb86fc',
//     background: '#121212',
//     surface: '#333333',
//     text: '#ffffff',
//     // Add any other colors you want to customize
//   },
// };

const CustomLightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#4A6460',
      background: '#F2F2F2',
      surface: '#E1F0F0 ',
      text: '#A3C1AD  ',
      // Add any other colors you want to customize
    },
  };
  
  const CustomDarkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#183D3D',
      background: '#040D12',
      surface: '#5C8374',
      text: '#93B1A6',
      // Add any other colors you want to customize
    },
  };

const themes = {
  light: CustomLightTheme,
  dark: CustomDarkTheme,
};

export default themes;


