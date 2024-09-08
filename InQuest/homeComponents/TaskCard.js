import React, { useState } from "react";
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Card, IconButton, Text, Checkbox, TouchableRipple, useTheme } from "react-native-paper";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { getPointsAndXP, checkForBadgeUnlock, updateUserRewards } from "../rewardSystem/Points";


export default function TaskCard({ task, onPress, onEdit, onComplete }){
    const completedSubtasks = task.subtasks ? task.subtasks.filter(subtask => subtask.checked).length : 0;
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    const theme = useTheme();

    return(
        <TouchableRipple onPress={onPress} rippleColor="rgba(0, 0, 0, .32)"> 
            <View style={styles.innerShadowContainer}>
                <Card onPress={onPress} style={[styles.card, backgroundColor=theme.colors.surface]}>
                    <View style={styles.cardHeader}>
                        <Card.Title 
                            title={task.title} 
                            titleVariant="titleLarge" 
                            titleStyle={{ color:theme.colors.primaryAlt, fontFamily: 'PlayfairDisplay-Bold' }} 
                        /> 
                        <IconButton
                            icon="pencil-outline"
                            size={20}
                            iconColor={theme.colors.primary}
                            onPress={onEdit}
                        />
                    </View>
                    <Card.Content>
                        <Text variant="bodyMedium" style={[styles.cardText, {color: theme.colors.text, fontFamily: 'Lora-Medium'}]}> Priority: {task.selectedPriority} </Text>
                        <Text variant="bodyMedium" style={[styles.cardText, {color: theme.colors.text, fontFamily: 'Lora-Medium'}]}> Category: {task.category}</Text>
                        <Text variant="bodyMedium" style={[styles.cardText, {color: theme.colors.text, fontFamily: 'Lora-Medium'}]}> Deadline: {task.deadline}</Text>
                        <View style={styles.bottomRow}>
                            {totalSubtasks > 0 && (
                                <AnimatedCircularProgress
                                    size={40}
                                    width={4}
                                    backgroundColor={theme.colors.primary}
                                    fill={Math.round(progress)}
                                    tintColor={theme.colors.primaryAlt}//color of the progress line 
                                    text = {Math.round(progress)}
                                >
                                    {
                                        (fill) => 
                                            <Text style={[styles.progressText, {color: theme.colors.primary, fontFamily: 'Montserrat-Medium'}]}> 
                                                {Math.round(progress)} %
                                            </Text>
                                        
                                    }
                                </AnimatedCircularProgress>
                            )}
                            <Checkbox
                                status={task.completed ? 'checked' : 'unchecked'}
                                onPress={onComplete}
                                color={theme.colors.primary}
                                uncheckedColor={theme.colors.primary}
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
        shadowColor:'#183D3D',
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
        borderRadius: 8,
        marginRight: 10
    },
    cardHeader:{ //using this
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 8,
    },
    cardText: { //using this
        fontSize: 17,
        
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
    },
});