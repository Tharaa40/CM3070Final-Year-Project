import React, { useState } from "react";
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Card, IconButton, Text, Checkbox, TouchableRipple } from "react-native-paper";
import { AnimatedCircularProgress } from "react-native-circular-progress";


export default function TaskCard({ task, onPress, onEdit, onComplete }){
    const completedSubtasks = task.subtasks ? task.subtasks.filter(subtask => subtask.checked).length : 0;
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;


    return(
        <TouchableRipple onPress={onPress} rippleColor="rgba(0, 0, 0, .32)"> 
            <View style={styles.innerShadowContainer}>
                <Card onPress={onPress} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Card.Title title={task.title} titleVariant="titleLarge" titleStyle={styles.cardTitle} /> 
                        <IconButton
                            icon="pencil-outline"
                            size={20}
                            color="#93B1A6"
                            onPress={onEdit}
                        />
                    </View>
                    <Card.Content>
                        <Text variant="bodyMedium" style={styles.cardText}> Priority: {task.selectedPriority} </Text>
                        <Text variant="bodyMedium" style={styles.cardText}> Category: {task.category}</Text>
                        <Text variant="bodyMedium" style={styles.cardText}> Deadline: {task.deadline}</Text>
                        <View style={styles.bottomRow}>
                            {totalSubtasks > 0 && (
                                <AnimatedCircularProgress
                                    size={40}
                                    width={4}
                                    backgroundColor="#5C8374"
                                    fill={Math.round(progress)}
                                    tintColor="black" //color of the progress line 
                                    text = {Math.round(progress)}
                                >
                                    {
                                        (fill) => <Text style={styles.progressText}> {Math.round(progress)} %</Text>
                                        
                                    }
                                </AnimatedCircularProgress>
                            )}
                            <Checkbox
                                status={task.completed ? 'checked' : 'unchecked'}
                                onPress={onComplete}
                                color="#5C8374"
                            />
                        </View>
                    </Card.Content>
                </Card>
            </View>
        </TouchableRipple>

            
            

    );
}

const styles = StyleSheet.create({
    innerShadowContainer:{ //for task cards ; using this
        shadowColor: '#000',
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        backgroundColor: '#183D3D',
        borderRadius: 8,
        marginRight: 10
    },
    card: { //using this
        backgroundColor: '#183D3D',
    }, 
    cardHeader:{ //using this
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 8,
    },
    cardTitle:{ //using this
        color: '#93B1A6'
    },
    cardText: { //using this
        color: '#93B1A6',
    },
    bottomRow:{ //using this
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    progressText:{ //using this
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white'
    },
});