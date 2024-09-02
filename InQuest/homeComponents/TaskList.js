import React from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { useTheme } from "react-native-paper";
import TaskCard from "./TaskCard"; 
import { handleTaskCompletion } from "../rewardSystem/Points";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

// export default function TaskList ({ tasks, handleTaskPress, handleEditTask, handleTaskComplete}){
//     const renderTask = ({ item }) => (
//         <TaskCard
//             task={item}
//             onPress={() => handleTaskPress(item)}
//             onEdit={() => handleEditTask(item)}
//             onComplete={() => handleTaskComplete(item)}
//         />
//     );

//     return(
//         <FlatList
//             data={tasks}
//             renderItem={renderTask}
//             keyExtractor={item => item.id}
//             contentContainerStyle={styles.list}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             ListEmptyComponent={<Text style={{ color: '#93B1A6', marginHorizontal: 10 }}>No tasks for today.</Text>}
//         />
//     )
// }


export default function TaskList ({ tasks, handleTaskPress, handleEditTask, handleTaskComplete}){
    const theme = useTheme();
    
    const renderTask = ({ item }) => (
        <TaskCard
            task={item}
            onPress={() => handleTaskPress(item)}
            onEdit={() => handleEditTask(item)}
            onComplete={() => handleTaskComplete(item)}
        />
    );

    return(
        <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={<Text style={{ color: theme.colors.text , marginHorizontal: 10 }}>No tasks here!</Text>}
        />
    )
}



const styles = StyleSheet.create({
    list: {
        paddingBottom: 20,
    },
});