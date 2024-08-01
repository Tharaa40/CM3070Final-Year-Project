import React, {useEffect, useState, useCallback} from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';

export default function Details({navigation}){
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState('');

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
            categorizeTasks(tasksList);
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
            screen: 'CreateTask',
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




    const renderItem = ({item}) =>(
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
            <View style={{flex:1}}>
                <Text>{item.title}</Text>
                <Text>{item.description}</Text>
                <Text>{item.deadline}</Text>
                <Text>{item.selectedPriority}</Text>
                <Text>{item.category}</Text>
            </View>
            <TouchableOpacity onPress={() => handleEdit(item)}>
                <Icon name='edit' size={24} color='blue'/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                <Icon name='trash' size={24} color='red' />
            </TouchableOpacity>
        </View>
    );


    const renderMonthTasks = (tasks, month) => (
        <View key={month} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}> {month} </Text>
            {tasks.length > 3 ? (
                <View>
                    {tasks.slice(0,3).map(task => (
                        <View key={task.id} style={{marginBottom: 10}}>
                            {renderItem({item: task})}
                        </View>
                    ))}
                    <TouchableOpacity onPress={() => Alert.alert('Show more tasks')}>
                        <Text style={{color: 'blue'}}> Show more... </Text>
                    </TouchableOpacity>
                </View>
            ): (
                tasks.map(task => (
                    <View key={task.id} style={{marginBottom: 10}}>
                        {renderItem({item: task})}
                    </View>
                ))
            )}
        </View>
    )

    return(
        <SafeAreaView>
            <ScrollView>
                {Object.keys(groupedTasks).map(month => (
                    renderMonthTasks(groupedTasks[month], month)
                ))}
            </ScrollView>
        </SafeAreaView>
        // <SafeAreaView>
        //     <FlatList
        //         data={tasks}
        //         renderItem={renderItem}
        //         keyExtractor={item => item.id}
        //     />
        // </SafeAreaView>
    );
    
}