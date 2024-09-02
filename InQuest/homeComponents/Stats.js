import React from "react";
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from "react-native-paper";
import moment from 'moment';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import LottieView from "lottie-react-native";


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
    const theme = useTheme();

    return(
        <View style={[styles.statsContainer, {backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.primary }]}>Your Stats</Text>
            
            <View style={styles.statRow}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.statLabel, {color: theme.colors.textAlt}]}>Total Tasks:</Text>
                <Text style={[styles.statValue, {color: theme.colors.textAlt}]}>{stats.totalTasks}</Text>
            </View>
            
            <View style={styles.statRow}>
                <MaterialCommunityIcons name="check-circle-outline" size={24} color={theme.colors.primaryAlt} />
                <Text style={[styles.statLabel, {color: theme.colors.textAlt}]}>Completed Tasks:</Text>
                <Text style={[styles.statValue, {color: theme.colors.textAlt}]}>{stats.completedTasks}</Text>
            </View>
            
            <View style={styles.statRow}>
                <MaterialCommunityIcons name="alert-circle-outline" size={24} color={theme.colors.accent} />
                <Text style={[styles.statLabel, {color: theme.colors.textAlt}]}>Remaining Tasks:</Text>
                <Text style={[styles.statValue, {color: theme.colors.textAlt}]}>{stats.remainingTasks}</Text>
            </View>
            
            <View style={styles.statRow}>
                <MaterialCommunityIcons name="percent-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.statLabel, {color: theme.colors.textAlt}]}>Completion Rate:</Text>
                <Text style={[styles.statValue, {color: theme.colors.textAlt}]}>{Math.round(stats.completionRate)}%</Text>
            </View>

            <View style={styles.statRow}>
                <MaterialCommunityIcons name="calendar-week" size={24} color={theme.colors.accent} />
                <Text style={[styles.statLabel, {color: theme.colors.textAlt}]}>Tasks Completed This Week:</Text>
                <Text style={[styles.statValue, {color: theme.colors.textAlt}]}>{stats.tasksCompletedThisWeek}</Text>
            </View>

            <View style={styles.statRow}>
                <MaterialCommunityIcons name="timer-outline" size={24} color={theme.colors.primaryAlt} />
                <Text style={[styles.statLabel, {color: theme.colors.textAlt}]}>Avg. Time per Task:</Text>
                <Text style={[styles.statValue, {color: theme.colors.textAlt}]}>{Math.round(stats.averageTimeSpentPerTask)} mins</Text>
            </View>

            <View style={[styles.statRow, {backgroundColor: theme.colors.surfaceAlt}]}>
                <MaterialCommunityIcons name="fire" size={24} color={theme.colors.accent} />
                <Text style={[styles.statLabel, {color: theme.colors.textAlt}]}>Productivity Streak:</Text>
                <Text style={[styles.statValue, {color: theme.colors.textAlt}]}>{stats.streaks} days</Text>
                <LottieView
                    source={require('../assets/badges/streak.json')}
                    autoPlay
                    loop
                    style={styles.streakAnimation}
                />
            </View>
        </View>
        // <View style={styles.statsContainer}>
        //     <Text style={styles.statLabel}>Total Tasks: {stats.totalTasks}</Text>
        //     <Text style={styles.statLabel}>Completed Tasks: {stats.completedTasks}</Text>
        //     <Text style={styles.statLabel}>Remaining Tasks: {stats.remainingTasks}</Text>
        //     <Text style={styles.statLabel}>Completion Rate: {Math.round(stats.completionRate)}%</Text>
        //     <Text style={styles.statLabel}>Tasks Completed This Week: {stats.tasksCompletedThisWeek}</Text>
        //     <Text style={styles.statLabel}>Average Time Spent per Task: {Math.round(stats.averageTimeSpentPerTask)} mins</Text>
        //     <Text style={styles.statLabel}>Productivity Streak: {stats.streaks} days</Text>
        // </View>
    );
}

const styles = StyleSheet.create({
    // statsContainer: {
    //     padding: 16,
    //     margin: 16,
    //     borderRadius: 12,
    //     // backgroundColor: '#fff',
    //     elevation: 2,
    //     shadowColor: '#000',
    //     shadowOpacity: 0.1,
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowRadius: 4,
    // },
    // title: {
    //     fontSize: 20,
    //     fontWeight: 'bold',
    //     marginBottom: 16,
    //     textAlign: 'center',
    // },
    // statRow: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'space-between',
    //     marginVertical: 8,
    // },
    // statLabel: {
    //     fontSize: 16,
    //     fontWeight: '500',
    //     flex: 1,
    // },
    // statValue: {
    //     fontSize: 16,
    //     fontWeight: 'bold',
    // },
    // streakAnimation: {
    //     width: 30,
    //     height: 30,
    // },



    statsContainer: {
        padding: 20,
        borderRadius: 10,
        margin: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1, 
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    statLabel: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    highlightRow: {
        // borderColor: theme.colors.accent,
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        // backgroundColor: theme.colors.surfaceAlt,
    },
    streakAnimation: {
        width: 40,
        height: 40,
    },

});