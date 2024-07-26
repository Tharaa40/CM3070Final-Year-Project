import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import SignUps from './screens/SignUp';
import EmailSignUp from './screens/EmailSignUp';
import Timer from './screens/Timer';
import CreateTask from './screens/CreateTask';
import Details from './screens/Details';
import HomePage from './screens/HomePage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* <Stack.Screen name='Login' component={Login} /> */}
        {/* <Stack.Screen name='Sign Up' component={SignUps} /> */}
        {/* <Stack.Screen name='Email Sign Up' component={EmailSignUp} /> */}
        <Stack.Screen name='Home Page' component={HomePage} />
        <Stack.Screen name='Create Task' component={CreateTask} />
        <Stack.Screen name='Task Collections' component={Details} />
        {/* <Stack.Screen name='Timer' component={Timer} /> */}


      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
