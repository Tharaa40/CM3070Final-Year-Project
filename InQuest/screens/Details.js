//this is the file after carousel

import React, {useEffect, useState, useCallbac, useMemo, useRef} from 'react';
import { SafeAreaView, View, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Animated, Dimensions,  } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, query, where, getDoc, setDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import moment, { months } from 'moment';
import { PaperProvider, Card, Text, useTheme } from 'react-native-paper';
// import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GestureDetector, GestureHandlerRootView, Gesture } from 'react-native-gesture-handler';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

export default function Details({navigation}){
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState('');
    const theme = useTheme();

    const scrollX = useRef(new Animated.Value(0)).current;
    const isFocused = useIsFocused();

    {/** This is to fetch and display tasks after creating tasks for specific user */}
    const fetchTasks = async() => {
        const user = FIREBASE_AUTH.currentUser;
        if(user){
            const user_Id = user.uid;
            const tasksCollection = collection(FIRESTORE_DB, 'tasks');
            const q = query(tasksCollection, where('userId' , '==', user_Id));
            const querySnapshot = await getDocs(q);
            const tasksList = [];
            querySnapshot.forEach((doc) => {
                tasksList.push({...doc.data(), id: doc.id});
            });
            setTasks(tasksList);
            // categorizeTasks(tasksList);
        }
    };

    const fetchUserData = async () => {
        const user = FIREBASE_AUTH.currentUser;
        if(user){
            const userDoc = await getDoc(doc(FIRESTORE_DB, "users", user.uid));
            if(userDoc.exists()){
                const userData = userDoc.data();
                setUsername(userData.username);
            }
        }
    };

    useEffect(() => {
        if(isFocused) {
            fetchTasks();
            fetchUserData();
        }   
    }, [isFocused]);
    {/** End of specific user code */}

   

    const handleEdit = (task) => {
        navigation.navigate('CreateTaskStack',{
            screen: 'Addtask',
            params: {task}
        });
        // navigation.navigate('CreateTask', {task});
    };

    const handleDelete = async (taskId) => {
        try {
            await deleteDoc(doc(FIRESTORE_DB, 'tasks', taskId));
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            console.log('Task deleted');
        } catch (error) {
            console.error('Error deleting task: ', error);
        }
    };

    const confirmDelete = (taskId) => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => handleDelete(taskId) }
            ]
        );
    };


    
    const groupTasksByMonth = (tasks) => { //Original
        return tasks.reduce((groups, task) => {
            const month = moment(task.deadline, 'M/D/YYYY').format('MMMM YYYY');
            if (!groups[month]){
                groups[month] = [];
            }
            groups[month].push(task);
            return groups;
        }, {});
    };
    const groupedTasks = groupTasksByMonth(tasks);

   
    const flatListData = Object.keys(groupedTasks).map(month => ({ month, tasks: groupedTasks[month] }));
    const renderItem = ({ item }) => (
        <View style={styles.monthContainer}>
            <Text variant='headlineLarge' style={[styles.monthTitle, {color: theme.colors.primaryAlt}]}>{item.month}</Text>
            <Carousel
                width={width}
                height={240}
                data={item.tasks}
                renderItem={({ item: task }) => (
                    <Card style={[styles.card, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}>
                        <Card.Content>
                            <Text variant='bodyLarge' style={{color: theme.colors.text, fontWeight: 'bold', marginBottom: 8}}>{task.title}</Text>
                            <Text variant='bodyLarge' style={{color: theme.colors.textAlt}}>{task.description}</Text>
                            <Text variant='bodyLarge' style={{color: theme.colors.textAlt}}>{task.deadline}</Text>
                            <Text variant='bodyLarge' style={{color: theme.colors.textAlt}}>{task.selectedPriority}</Text>
                            <Text variant='bodyLarge' style={{color: theme.colors.textAlt}}>{task.category}</Text>
                        </Card.Content>
                        <Card.Actions>
                            <TouchableOpacity onPress={() => handleEdit(task)}>
                                <Icon name='edit' size={24} color={theme.colors.primary}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => confirmDelete(task.id)}>
                                <Icon name='trash' size={24} color={theme.colors.accent} />
                            </TouchableOpacity>
                        </Card.Actions>
                    </Card>
                )}
                keyExtractor={(task) => task.id}
                loop={false}
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 50,
                }}
            />
        </View>
    );

   
    return(


        <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <Text variant='displaySmall' style={[styles.title, {color: theme.colors.primary}]}> Tasks of the Year </Text>
            <FlatList
                data={flatListData}
                renderItem={renderItem}
                keyExtractor={(item) => item.month}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>


    );
    
}


const styles=StyleSheet.create({
    container: {
        flex:1,
        // marginHorizontal: 10, 
        // marginVertical: 10,
    }, 
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 30,
        marginVertical: 20,
        // marginBottom: 20,
    },
    monthContainer: {
        paddingLeft: 5,
        paddingRight: 5,
    },
    monthTitle: {
        // fontSize:20, 
        marginHorizontal: 20
    }, 
    card: {
        // marginRight: '10%',
        // marginBottom: 5, 
        // elevation: 3,
        // // backgroundColor: '#183D3D',
        // borderWidth: 3, 
        // // borderColor: '#5C8374',
        // borderRadius: 30,

        borderRadius: 30,
        borderWidth: 2,
        padding: 5,
        marginRight: '10%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
   
    // page:{
    //     marginHorizontal: 10,
    //     marginVertical: 10
    // },
    // title:{
    //     alignItems: 'center',
    // },
    // titleText:{
    //     fontWeight: 'bold'
    // },

    // detailsContainer: {
    //     flex: 1,
    //     padding: 16,
    // },


  
    // card: {
    //     marginBottom: 5, 
    //     elevation: 3,
    // },
    // taskTitle:{
    //     fontSize: 18, 
    //     fontWeight: 'bold'
    // },
    // // container: {
    // //     flex: 1,
    // // },
    // // contentContainer:{
    // //     padding: 10,
    // // },
    // monthContainer:{
    //     marginBottom: '50%'
    // },
    // monthTitle:{
    //     fontSize: 20, 
    //     marginVertical: 5,
    //     marginTop: 15,
    // },


    // container: {
    //     // flex: 1
    //     marginHorizontal: 10, 
    //     marginVertical: 5,
    // },
    // title:{
    //     textAlign: 'center',
    //     fontWeight: 'bold',
    //     fontSize: 28
    // },
    // monthContainer: {
    //     // marginBottom: 10,
    // },
    // monthTitle:{
    //     fontSize: 20,
    //     // marginVertical: 5,
    // },
    // card:{
    //     marginBottom: 10,
    //     elevation: 3,
    // },
    




});


