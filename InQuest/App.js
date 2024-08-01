import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome6';

import HomePage from './screens/HomePage';
import CreateTask from './screens/CreateTask';
import Details from './screens/Details';
import Calendar from './screens/Calendar';
import Settings from './screens/Settings';
import Timer from './screens/Timer';
import Login from './screens/Login';
import SignUps from './screens/SignUp';
import EmailSignUp from './screens/EmailSignUp';
import Landing from './screens/Landing';
import CalendarView from './screens/Calendar';


// import Login from './screens/Login';
// import SignUps from './screens/SignUp';
// import EmailSignUp from './screens/EmailSignUp';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function MainTabs() {
  return(
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({color, size }) => {
          let iconName; 

          switch (route.name){
            case 'HomePage': 
              iconName = 'house';
              break;
            case 'Details': 
              iconName = 'list-ul';
              break;
            case 'CreateTaskStack': 
              iconName = 'circle-plus';
              break;
            case 'CalendarStack':
              iconName = 'calendar';
              break;
            case 'Timer':
              iconName = 'clock';
              break;
            default:
              iconName = 'circle';
              break;
          }
          return <Icon name={iconName} size={size} color={color} />
        },
        // tabBarVisible: getTabBarVisible(route),
      })}
    >
      <Tab.Screen 
        name='HomePage' 
        component={HomePage}
        options={{ headerShown: false}} 
      />
      <Tab.Screen 
        name='Details' 
        component={Details} 
        options = {{ title: 'Tasks of the Year'}}
        // options={{ headerShown: false}} 
      />
      <Tab.Screen 
        name='CreateTaskStack' 
        component={CreateTaskStack}  
        options={{ 
          tabBarStyle: {display: 'none'},
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name='CalendarStack' 
        component={CalendarStack}  
        options={{ 
          tabBarStyle: {display: 'none'}, 
          headerShown: false
        }}  
      />
      <Tab.Screen 
        name='Timer' 
        component={Timer} 
        options={{
          headerShown: false
        }}
      />
      <Tab.Screen
        name='Settings'
        component={Settings}
        options={{
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
}


// Stack Navigator for CreateTask screen
function CreateTaskStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="CreateTask" 
        component={CreateTask}
        options={{presentation: 'modal'}}  
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for Calendar screen
function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Calendar" component={CalendarView} />
    </Stack.Navigator>
  );
}




export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false}} initialRouteName='HomePage'>
        {/* <Stack.Screen name='Landing' component={Landing}/> */}
        <Stack.Screen name='Login' component={Login}/>
        <Stack.Screen name='SignUp' component={SignUps}/>
        <Stack.Screen name='EmailSignUp' component={EmailSignUp}/>
        <Stack.Screen name='MainTabs' component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


