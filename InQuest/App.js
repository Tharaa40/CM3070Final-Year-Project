import React, { useEffect, useState, useRef, useMemo } from 'react';
// import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PaperProvider } from 'react-native-paper';

import Details from './screens/Details';
import Calendar from './screens/Calendar';
import Settings from './screens/Settings';
import Timer from './screens/Timer';
import Login from './screens/Login';
import SignUps from './screens/SignUp';
import EmailSignUp from './screens/EmailSignUp';
import Landing from './screens/Landing';
import CalendarView from './screens/Calendar';
import CalendarView2 from './screens/Calendar2';
import Avatar from './screens/Avatar';
import CreateTask from './screens/CreateTask';

import HomePage from './screens/HomePage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GestureDetectorProvider } from 'react-native-screens/gesture-handler'
import TaskBottomSheet from './screens/BottomSheet';


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
        iconComponent = <Icon name={iconName} color={color} size={size} style={styles.addIcon} />;
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
    // return <Icon name={iconName} color={color} size={size} />
  }, 
  tabBarActiveTintColor: 'tomato',
  tabBarInactiveTintColor: 'gray',
  tabBarStyle: {
    height: 50,
    borderRadius: 150,
    position: 'relative',
  },
});

// Stack Navigator for CreateTask screen
function CreateTaskStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="Addtask" 
        // component={CreateTask}
        component={TaskBottomSheet}
        // component={BottomsheetFunc}
        options={{presentation: 'modal'}}  
      />
    </Stack.Navigator>
  );
}


const BottomTab = () => {
  // const bottomSheetModalRef = useRef();
  // const handleOpenCreateTask = () => {
  //   bottomSheetModalRef.current?.present();
  // };

  return(
        <Tab.Navigator screenOptions={screenOptions}> 
          <Tab.Screen name='HomeTab' component={HomePage} />
          <Tab.Screen name='Details' component={Details}/>
          {/* <Tab.Screen name='Create Task' component={CreateTask}/> */}
          <Tab.Screen
            // name='CreateTask'
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



export default function App () {
  return(
    <GestureHandlerRootView>
      <GestureDetectorProvider>
        <NavigationContainer>
            <Stack.Navigator
              screenOptions={{headerShown: false}}
              initialRouteName='Login'
            >
              <Stack.Screen name='Login' component={Login} />
              <Stack.Screen name='SignUp' component={SignUps} />
              <Stack.Screen name='EmailSignUp' component={EmailSignUp}/>
              <Stack.Screen name='HomeTab' component={BottomTab} options={{headerShown: false}} />
              <Stack.Screen name='CreateTaskStack' component={CreateTaskStack} />
              {/* <Stack.Screen name='Addtask' component={TaskBottomSheet} options={{headerShown: false}}/> */}
            </Stack.Navigator>
        </NavigationContainer>
      </GestureDetectorProvider>
    </GestureHandlerRootView>
      
  );
}

const styles = StyleSheet.create({
  addIcon: {
    position: 'absolute', 
    top: -30,  // Adjust this value to position the icon vertically
    width: 60, 
    height: 60, 
    backgroundColor: 'blue', 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }
});













