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
    );
}

const styles = StyleSheet.create({
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
        fontSize: 24,
        fontFamily: 'PlayfairDisplay-Bold',
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
        fontFamily: 'Lora-Medium',
        marginLeft: 10,
    },
    statValue: {
        fontSize: 16,
        fontFamily: 'Montserrat-Medium',
    },
    highlightRow: {
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
    },
    streakAnimation: {
        width: 40,
        height: 40,
    },

});