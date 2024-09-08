import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import merge from 'deepmerge';


const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#769FCD', // Buttons, active icons, headers
    primaryAlt: '#466A9B', // Darker alternative for primary
    accent: '#FF6B6B', // Highlights and warnings
    background: '#F7FBFC', // Main background
    surface: '#D6E6F2', // Cards, modals, and dropdown menus
    surfaceAlt: '#F0F4F8', // Slightly darker background
    text: '#B9D7EA', // Lighter text
    textAlt: '#5A7081', // Darker text for better readability
    border: '#A4B0BF', // Borders and dividers
  },
};
  
  const CustomDarkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#7C7BCA', // Buttons, active icons, headers
      primaryAlt: '#5857A6', // Darker alternative for primary
      accent: '#E76F51', // Highlights and warnings
      background: '#1A1A2E', // Main background
      surface: '#16213E', // Cards, modals, and dropdown menus
      surfaceAlt: '#0F3460', // Slightly darker background for contrast
      text: '#EAEAEA',// Light text color for readability
      textAlt: '#A3A3A3', // Darker text for muted elements or less emphasis
      border: '#4E4E50', // Borders and dividers
    },
  };
  

const themes = {
  light: CustomLightTheme,
  dark: CustomDarkTheme,
};

export default themes;


