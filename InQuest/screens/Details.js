import React, {useEffect, useState, useCallbac, useMemo, useRef} from 'react';
import { SafeAreaView, View, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, query, where, getDoc, setDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import { PaperProvider, Text, Card } from 'react-native-paper';
// import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GestureDetector, GestureHandlerRootView, Gesture } from 'react-native-gesture-handler';


const { width } = Dimensions.get('window');

export default function Details({navigation}){
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState('');

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



    // const groupTasksByMonth = (tasks) => {
    //     return tasks.reduce((groups, task) => {
    //         const month = moment(task.deadline, 'M/D/YYYY').format('MMMM YYYY');
    //         if (!groups[month]){
    //             groups[month] = [];
    //         }
    //         groups[month].push(task);
    //         return groups;
    //     }, {});
    // };
    // const groupedTasks = groupTasksByMonth(tasks);




    // const renderItem = ({item}) =>(
    //     <Card style={{marginBottom: 10, elevation: 3}}>
    //         <Card.Content style={{flex: 1}}>
    //             <Text variant='bodyMedium'>{item.title}</Text>
    //             <Text variant='bodyMedium'>{item.description}</Text>
    //             <Text variant='bodyMedium'>{item.deadline}</Text>
    //             <Text variant='bodyMedium'>{item.selectedPriority}</Text>
    //             <Text variant='bodyMedium'>{item.category}</Text>
    //         </Card.Content>
    //         <Card.Actions>
    //             <TouchableOpacity onPress={() => handleEdit(item)}>
    //                 <Icon name='edit' size={24} color='blue'/>
    //             </TouchableOpacity>
    //             <TouchableOpacity onPress={() => confirmDelete(item.id)}>
    //                 <Icon name='trash' size={24} color='red' />
    //             </TouchableOpacity>
    //         </Card.Actions>
    //     </Card>
    //     // <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 8}}>
    //     //     <View style={{flex:1}}>
    //     //         <Text variant='bodyMedium'>{item.title}</Text>
    //     //         <Text variant='bodyMedium'>{item.description}</Text>
    //     //         <Text variant='bodyMedium'>{item.deadline}</Text>
    //     //         <Text variant='bodyMedium'>{item.selectedPriority}</Text>
    //     //         <Text variant='bodyMedium'>{item.category}</Text>
    //     //     </View>
    //     //     <TouchableOpacity onPress={() => handleEdit(item)}>
    //     //         <Icon name='edit' size={24} color='blue'/>
    //     //     </TouchableOpacity>
    //     //     <TouchableOpacity onPress={() => confirmDelete(item.id)}>
    //     //         <Icon name='trash' size={24} color='red' />
    //     //     </TouchableOpacity>
    //     // </View>
    // );


    // const renderMonthTasks = (tasks, month) => (
    //     <View key={month} style={{ marginBottom: 20 }}>
    //         <Text variant='headlineMedium' style={{ fontSize: 20 }}> {month} </Text>
    //         {tasks.map(task => (
    //             <View key={task.id} style={{marginBottom: 10}}>
    //                 {renderItem({item: task})}
    //             </View>
    //         ))}
    //         {/* {tasks.length > 3 ? (
    //             <View>
    //                 {tasks.slice(0,3).map(task => (
    //                     <View key={task.id} style={{marginBottom: 10}}>
    //                         {renderItem({item: task})}
    //                     </View>
    //                 ))}
    //                 <TouchableOpacity onPress={() => Alert.alert('Show more tasks')}>
    //                     <Text style={{color: 'blue'}}> Show more... </Text>
    //                 </TouchableOpacity>
    //             </View>
    //         ): (
    //             tasks.map(task => (
    //                 <View key={task.id} style={{marginBottom: 10}}>
    //                     {renderItem({item: task})}
    //                 </View>
    //             ))
    //         )} */}
    //     </View>
    // );

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    const groupTasksByMonth = (tasks) => {
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

    const renderItem = ({item, index}) =>{

        // Animation logic
        const translateY = new Animated.Value(index);
        const opacity = new Animated.Value(1);
        return(
            <Animated.View style={{
                transform: [{ translateY }],
                opacity, marginBottom: 1,
            }}                
            >
                <Card style={{marginBottom: 5, elevation: 3}}>
                    <Card.Content style={{flex: 1}}>
                        <Text variant='bodyMedium'>{item.title}</Text>
                        <Text variant='bodyMedium'>{item.description}</Text>
                        <Text variant='bodyMedium'>{item.deadline}</Text>
                        <Text variant='bodyMedium'>{item.selectedPriority}</Text>
                        <Text variant='bodyMedium'>{item.category}</Text>
                    </Card.Content>
                    <Card.Actions>
                        <TouchableOpacity onPress={() => handleEdit(item)}>
                            <Icon name='edit' size={24} color='blue'/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                            <Icon name='trash' size={24} color='red' />
                        </TouchableOpacity>
                    </Card.Actions>
                </Card>
            </Animated.View>
        );
    };


    const renderMonthTasks = (tasks, month) => (
        <View key={month} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 20, marginVertical: 5 }}> {month} </Text>
            <FlatList
                data={tasks}
                renderItem={renderItem}
                keyExtractor={task => task.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10 }}

            />
        </View>
    );



    return(
        <PaperProvider>
            <SafeAreaView>
                <ScrollView contentContainerStyle={{ padding: 10 }}>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center' }}> Tasks of the Year </Text>
                    </View>
                    {Object.keys(groupedTasks).map(month => (
                        renderMonthTasks(groupedTasks[month], month)
                    ))}
                </ScrollView>
            </SafeAreaView>
        </PaperProvider>





        // <PaperProvider>
        //     <SafeAreaView>
        //         <ScrollView contentContainerStyle={styles.page}>
        //             <View style={styles.title}>
        //                 <Text variant='displaySmall' style={styles.titleText}> Tasks of the Year </Text>
        //             </View>
                    
                    
        //             {Object.keys(groupedTasks).map(month => (
        //                 renderMonthTasks(groupedTasks[month], month)
        //             ))}
        //         </ScrollView>
        //     </SafeAreaView>
        // </PaperProvider>
    );
    
}


const styles=StyleSheet.create({
    page:{
        marginHorizontal: 10,
        marginVertical: 10
    },
    title:{
        alignItems: 'center',
    },
    titleText:{
        fontWeight: 'bold'
    },

    detailsContainer: {
        flex: 1,
        padding: 16,
    },


    container: {
        // position: 'relative',
    },
    stackCard: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderRadius: 10,
        backgroundColor: 'white',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },



});


