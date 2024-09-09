import React, { useEffect, useState,  } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GestureDetectorProvider } from 'react-native-screens/gesture-handler'

import Login from './screens/Login'; //using
// import SignUps from './screens/SignUp'; //not using

import HomePage from './screens/HomePage';//using
import Details from './screens/Details'; //using
import TaskBottomSheet from './screens/BottomSheet'; //using
import CalendarView2 from './screens/Calendar2'; //using
import Timer from './screens/Timer'; //using
import Settings from './screens/Settings'; //using
import Progress from './screens/Progress';



import EmailSignUp from './screens/EmailSignUp'; //using
// import Avatar from './screens/Avatar';  //using

import themes from './components/Theme';
import { MusicProvider } from './components/MusicContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from './firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();



// const screenOptions = ({ route }) => ({
//   tabBarShowLabel: false, 
//   headerShown: false,
//   tabBarIcon:({ color, size, focused }) => {
//     let iconName; 
//     let iconComponent;

//     switch (route.name) {
//       case 'HomeTab':
//         iconName = 'home-outline';
//         iconComponent = <Icon name={iconName} color={color} size={size} />;
//         break;
//       case 'Details':
//         iconName = 'check-outline';
//         iconComponent = <Icon name={iconName} color={color} size={size} />;
//         break;
//       case 'Addtask':
//         iconName = 'plus-box-outline';
//         iconComponent = (
//           <View style={styles.addIconContainer}>
//             <Icon name={iconName} color={color} size={size} style={styles.addIcon} />
//           </View>
//         )
//         // iconComponent = <Icon name={iconName} color={color} size={size} style={styles.addIcon} />;
//         break;
//       case 'Calendar':
//         iconName = 'calendar-outline';
//         iconComponent = <Icon name={iconName} color={color} size={size} />;
//         break;
//       case 'Timer':
//         iconName = 'timer-outline';
//         iconComponent = <Icon name={iconName} color={color} size={size} />;
//         break;
//       default:
//         iconName = 'help-circle-outline';
//         iconComponent = <Icon name={iconName} color={color} size={size} />;
//         break;
//     }
//     return iconComponent;
//     // return <Icon name={iconName} color={color} size={size} />
//   }, 
//   tabBarActiveTintColor: 'tomato',
//   tabBarInactiveTintColor: 'gray',
//   tabBarStyle: {
//     height: 50, //original 
//     backgroundColor: 'beige', //original 
//     position: 'relative', //original
//   },
// });


const screenOptions = ({ route }) => ({
  tabBarShowLabel: false, 
  headerShown: false,
  tabBarIcon: ({ color, size, focused }) => {
    let iconName; 
    let iconComponent;

    switch (route.name) {
      case 'HomeTab':
        iconName = 'home-outline';
        break;
      case 'Details':
        iconName = 'check-outline';
        break;
      case 'Addtask':
        iconName = 'plus-box-outline';
        break;
      case 'Calendar':
        iconName = 'calendar-outline';
        break;
      case 'Timer':
        iconName = 'timer-outline';
        break;
      default:
        iconName = 'help-circle-outline';
        break;
    }

    iconComponent = (
      <View style={route.name === 'Addtask' ? styles.addIconContainer : {}}>
        <Icon name={iconName} color={color} size={size} style={route.name === 'Addtask' ? styles.addIcon : {}} />
      </View>
    );

    return iconComponent;
  },
  tabBarActiveTintColor: 'tomato',
  tabBarInactiveTintColor: 'gray',
  tabBarStyle: {
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    position: 'absolute', 
    bottom: 0, 
    width: '100%',
    zIndex: 10, 
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

  const [fontsLoaded] = useFonts({
    "PlayfairDisplay-Bold": require("./assets/fonts/PlayfairDisplay-Bold.ttf"),
    "Lora-Medium": require("./assets/fonts/Lora-Medium.ttf"),
    "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
    "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
    "SourceSans3-Regular": require("./assets/fonts/SourceSans3-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <GestureDetectorProvider>
          <Text> Getting Ready</Text> 
        </GestureDetectorProvider>
      </GestureHandlerRootView>
    );
  }

  return(
    <GestureHandlerRootView style={{flex: 1}}>
      <GestureDetectorProvider>
          <PaperProvider theme={currentTheme}>
            <MusicProvider>
              <SafeAreaProvider>
                <NavigationContainer>
                    <Stack.Navigator
                      screenOptions={{headerShown: false}}
                      initialRouteName='Login'
                    >
                      <Stack.Screen name='Login' component={Login} /> 
                      {/* <Stack.Screen name='SignUp' component={SignUps} /> */}
                      <Stack.Screen name='EmailSignUp' component={EmailSignUp}/> 
                      <Stack.Screen name='HomeTab'>
                        {props => <BottomTab {...props} toggleTheme={toggleTheme} />}
                      </Stack.Screen>
                      <Stack.Screen name='CreateTaskStack' component={CreateTaskStack} />
                      <Stack.Screen name='Settings' component={Settings}/>
                      <Stack.Screen name='Progress' component={Progress} />
                      {/* <Stack.Screen name='Avatar' component={Avatar}/> */}
                      {/* <Stack.Screen name='Addtask' component={TaskBottomSheet} options={{headerShown: false}}/> really not using */}
                    </Stack.Navigator>
                </NavigationContainer>
              </SafeAreaProvider>
            </MusicProvider>
          </PaperProvider>
      </GestureDetectorProvider>
    </GestureHandlerRootView>
  );
}


// const styles = StyleSheet.create({
//   addIconContainer: {
//     position: 'absolute', 
//     top: -30,  // Adjust this value to position the icon vertically
//     width: 60, 
//     height: 60, 
//     backgroundColor: 'white', 
//     borderRadius: 30, 
//     borderWidth: 2, 
//     borderColor: 'red',
//     justifyContent: 'center', 
//     alignItems: 'center',
//     shadowColor: 'black',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   addIcon:{
//     position: 'absolute'
//   }
// });


const styles = StyleSheet.create({
  addIconContainer: {
    position: 'absolute', 
    top: -30,  // Position the icon above the tab bar
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
  addIcon: {
    // No additional styles needed for this icon
  }
});



























