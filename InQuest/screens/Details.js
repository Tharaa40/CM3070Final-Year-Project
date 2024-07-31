import React, {useEffect, useState, useCallback} from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';

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
        navigation.navigate('CreateTask', {task});
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

    return(
        <SafeAreaView>
            <FlatList
                data={tasks}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    );
    
}