import React from "react";
import { View, StyleSheet } from 'react-native';
import { Text } from "react-native-paper";
import moment from 'moment';


export const calculateStats = (tasks=[]) => {
    const totalTasks = tasks.length; 
    const completedTasks = tasks.filter(task => task.completed).length;
    const remainingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const tasksCompletedThisWeek = tasks.filter(task =>
        task.completed && moment(task.completedAt).isSame(moment(), 'week')
    ).length;
    const totalTaskTime = tasks.reduce((acc, task) => acc + (task.timeSpent || 0), 0);
    const averageTimeSpentPerTask = completedTasks > 0 ? totalTaskTime / completedTasks : 0;
    const streaks = tasks.reduce((streak, task) => {
        if (task.completed) {
            const isSameDay = moment(task.completedAt).isSame(moment(streak.lastCompletedDate), 'day');
            if (isSameDay) {
                streak.currentStreak++;
            } else {
                streak.currentStreak = 1;
            }
            streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
            streak.lastCompletedDate = task.completedAt;
        }
        return streak;
    }, { longestStreak: 0, currentStreak: 0, lastCompletedDate: null }).longestStreak;

    return{
        totalTasks, completedTasks, remainingTasks, completionRate, tasksCompletedThisWeek, averageTimeSpentPerTask, streaks
    };

}

export default function Stats ({ stats }){
    return(
        <View style={styles.statsContainer}>
            <Text style={styles.statLabel}>Total Tasks: {stats.totalTasks}</Text>
            <Text style={styles.statLabel}>Completed Tasks: {stats.completedTasks}</Text>
            <Text style={styles.statLabel}>Remaining Tasks: {stats.remainingTasks}</Text>
            <Text style={styles.statLabel}>Completion Rate: {Math.round(stats.completionRate)}%</Text>
            <Text style={styles.statLabel}>Tasks Completed This Week: {stats.tasksCompletedThisWeek}</Text>
            <Text style={styles.statLabel}>Average Time Spent per Task: {Math.round(stats.averageTimeSpentPerTask)} mins</Text>
            <Text style={styles.statLabel}>Productivity Streak: {stats.streaks} days</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    statsContainer: {
        // padding: 20,
        marginTop: 20,
    },
    statLabel:{
        // color: '#93B1A6',
        fontSize: 16,
        marginBottom: 10,
    },
});