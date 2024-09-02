import React, { useEffect, useState, useRef, useMemo } from 'react';
import { StyleSheet, StatusBar, TouchableOpacity, Text, View } from 'react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import merge from 'deepmerge';
import { PaperProvider } from 'react-native-paper';

import Details from './screens/Details'; //using
import Settings from './screens/Settings'; //using
import Timer from './screens/Timer'; //using
import Login from './screens/Login'; //using
import SignUps from './screens/SignUp'; //using
import EmailSignUp from './screens/EmailSignUp'; //using
import CalendarView2 from './screens/Calendar2'; //using
import Avatar from './screens/Avatar';  //using
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GestureDetectorProvider } from 'react-native-screens/gesture-handler'
import TaskBottomSheet from './screens/BottomSheet'; //using
import HomePage from './screens/HomePage';//using
import Progress from './screens/Progress';
import themes from './components/Theme';
import AvatarMenu from './homeComponents/AvatarMenu';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from './firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const screenOptions = ({ route }) => ({
  tabBarShowLabel: false, 
  headerShown: false,
  tabBarIcon:({ color, size, focused }) => {
    let iconName; 
    let iconComponent;

    switch (route.name) {
      case 'HomeTab':
        iconName = 'home-outline';
        iconComponent = <Icon name={iconName} color={color} size={size} />;
        break;
      case 'Details':
        iconName = 'check-outline';
        iconComponent = <Icon name={iconName} color={color} size={size} />;
        break;
      case 'Addtask':
        iconName = 'plus-box-outline';
        iconComponent = (
          <View style={styles.addIconContainer}>
            <Icon name={iconName} color={color} size={size} style={styles.addIcon} />
          </View>
        )
        break;
      case 'Calendar':
        iconName = 'calendar-outline';
        iconComponent = <Icon name={iconName} color={color} size={size} />;
        break;
      case 'Timer':
        iconName = 'timer-outline';
        iconComponent = <Icon name={iconName} color={color} size={size} />;
        break;
      default:
        iconName = 'help-circle-outline';
        iconComponent = <Icon name={iconName} color={color} size={size} />;
        break;
    }
    return iconComponent;
  }, 
  tabBarActiveTintColor: 'tomato',
  tabBarInactiveTintColor: 'gray',
  tabBarStyle: {
    height: 50,
    backgroundColor: 'beige',
    position: 'relative',
  },
});

// Stack Navigator for CreateTask screen
function CreateTaskStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="Addtask" 
        component={TaskBottomSheet}
        options={{presentation: 'modal'}}  
      />
    </Stack.Navigator>
  );
}


const BottomTab = ({toggleTheme}) => {
  return(
        <Tab.Navigator screenOptions={screenOptions}> 
          <Tab.Screen name='HomeTab'>
            {props => <HomePage {...props} toggleTheme={toggleTheme} />}
          </Tab.Screen>
          <Tab.Screen name='Details' component={Details}/>
          <Tab.Screen
            name='Addtask'
            options={{
              tabBarStyle:{display: 'none'}
            }}
            // component={CreateTask}
            component={TaskBottomSheet}
            listeners={({ navigation }) => ({
              tabPress: e => {
                e.preventDefault();
                navigation.navigate('Addtask');
              },
            })}
          />
          <Tab.Screen name='Calendar' component={CalendarView2}/>
          <Tab.Screen name='Timer' component={Timer} />
        </Tab.Navigator>


  )
}

const saveThemePreference = async(userId, theme) => {
  try{
    const userRef = doc(FIRESTORE_DB, 'users', userId); 
    await setDoc(userRef, {themePreference: theme}, {merge: true});
  }catch(error){
    console.error('Failed to save the theme preference', error);
  }
};

const loadThemePreference = async(userId, setIsDarkTheme) => {
  try{
    const userRef = doc(FIRESTORE_DB, 'users', userId);
    const userDoc = await getDoc(userRef);

    if(userDoc.exists()){
      const userData = userDoc.data();
      if(userData.themePreference){
        setIsDarkTheme(userData.themePreference == 'dark');
      }
    }
  }catch(error){
    console.error('Failed to laod the theme preference', error);
  }
};


export default function App () {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if(user){
        setUserId(user.uid);
      }else{
        setUserId(null);
      }
    });
    return() => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      loadThemePreference(userId, setIsDarkTheme);
    }
  }, [userId]);

  const toggleTheme = async() => {
    const newTheme = !isDarkTheme ? 'dark' : 'light';
    setIsDarkTheme(!isDarkTheme);
    if(userId){
      await saveThemePreference(userId, newTheme);
    }
  }

  const currentTheme = isDarkTheme ? themes.dark : themes.light;

  return(
    <GestureHandlerRootView style={{flex: 1}}>
      <GestureDetectorProvider>
        <PaperProvider theme={currentTheme}>
          <NavigationContainer>
              <Stack.Navigator
                screenOptions={{headerShown: false}}
                initialRouteName='Login'
              >
                <Stack.Screen name='Login' component={Login} /> 
                <Stack.Screen name='SignUp' component={SignUps} />
                <Stack.Screen name='EmailSignUp' component={EmailSignUp}/> 
                <Stack.Screen name='HomeTab'>
                  {props => <BottomTab {...props} toggleTheme={toggleTheme} />}
                </Stack.Screen>
                <Stack.Screen name='CreateTaskStack' component={CreateTaskStack} />
                <Stack.Screen name='Settings' component={Settings}/>
                <Stack.Screen name='Progress' component={Progress} />
                <Stack.Screen name='Avatar' component={Avatar}/>
              </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </GestureDetectorProvider>
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({
  addIconContainer: {
    position: 'absolute', 
    top: -30,  // Adjust this value to position the icon vertically
    width: 60, 
    height: 60, 
    backgroundColor: 'white', 
    borderRadius: 30, 
    borderWidth: 2, 
    borderColor: 'red',
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addIcon:{
    position: 'absolute'
  }
});



























