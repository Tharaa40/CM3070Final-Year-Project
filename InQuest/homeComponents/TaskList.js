import React from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import TaskCard from "./TaskCard";

export default function TaskList ({ tasks, handleTaskPress, handleEditTask, handleTaskComplete}){
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
            ListEmptyComponent={<Text style={{ color: '#93B1A6', marginHorizontal: 10 }}>No tasks for today.</Text>}
        />
    )
}



const styles = StyleSheet.create({
    list: {
        paddingBottom: 100,
    },
});