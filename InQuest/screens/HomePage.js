//this is the homepage after refractoring

import React, {useState, useEffect}  from "react";
import { ScrollView, View, StatusBar, Modal, StyleSheet, Dimensions, TouchableOpacity} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {  Text, Divider, useTheme} from 'react-native-paper';
import moment from "moment";
import { collection, getDocs, updateDoc, doc, getDoc, query, where } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import TaskList from "../homeComponents/TaskList";
import Stats from "../homeComponents/Stats";
import { calculateStats } from "../homeComponents/Stats";
import Header from "../homeComponents/Header";
import Chart from "../homeComponents/Chart";
import { updateUserRewards } from "../rewardSystem/Points";


export default function HomePage({toggleTheme}){
    const [tasks, setTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [otherTasks, setOtherTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [calculatedStats, setCalculatedStats] = useState({});
    const [points, setPoints] = useState(0);
    const [xp, setXp] = useState(0);

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const theme = useTheme();
    const user = FIREBASE_AUTH.currentUser;

    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        remainingTasks: 0,
        completionRate: 0,
        tasksCompletedThisWeek: 0,
        averageTimeSpentPerTask: 0,
        streaks: 0
    });
  

    {/** This is to fetch and display tasks after creating tasks for specific user */}
    const fetchTasks = async() => {
        if(user){
            const user_Id = user.uid;
            const tasksCollection = collection(FIRESTORE_DB, 'tasks');
            const q = query(tasksCollection, where('userId' , '==', user_Id));
            const querySnapshot = await getDocs(q);
            const tasksList = [];
            querySnapshot.forEach((doc) => {
                tasksList.push({...doc.data(), id: doc.id, checked: false});
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
                setPoints(userData.points || 0);
                setXp(userData.xp || 0);
            }
        }
    };


    useEffect(() => {
        if(isFocused) {
            fetchTasks();
            fetchUserData();
            const calculatedStats = calculateStats(tasks);
            setStats(calculatedStats);
        }   
    }, [isFocused, tasks]);
    {/** End of specific user code */}    

    const categorizeTasks = (tasks) => {
        const today = moment().startOf('day');
        const threeDaysFromNow = moment().add(3, 'days').endOf('day');
    
        const todayTasks = tasks.filter(task => { //2nd method
            if(task.completed){
                return false;
            }
            const tdyTaskDeadline = moment(task.deadline, `M/DD/YYYY h:mm A`);
            if(!tdyTaskDeadline.isValid()){
                console.warn(`Invalid today task deadline format: ${task.deadline}`);
            }
            return tdyTaskDeadline.isSame(today, 'day');
        });



        const otherTasks = tasks.filter(task => { //2nd method
            if (task.completed) {
                return false; // Exclude completed tasks
            }
            const othTaskDeadline = moment(task.deadline, 'MM/DD/YYYY h:mm A');
            if (!othTaskDeadline.isValid()) {
                console.warn(`Invalid other task deadline format: ${task.deadline}`);
            }
            return othTaskDeadline.isAfter(today, 'day') && othTaskDeadline.isSameOrBefore(threeDaysFromNow, 'day');
        });
    
        setTodayTasks(todayTasks);
        setOtherTasks(otherTasks);
    };

    const handleEditTask = (task) => {
        navigation.navigate('CreateTaskStack',{
            screen: 'Addtask',
            params: {task}
        });
        // navigation.navigate('Addtask', { task });
    };

    const handleTaskPress = (task) => {
        setSelectedTask(task);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedTask(null);
    };

    const handleTaskComplete = async(task) => { 
        try{
            

            const newStatus = !task.completed;
            const taskRef = doc(FIRESTORE_DB, 'tasks', task.id);
            const taskDoc = await getDoc(taskRef);
            const taskData = taskDoc.data();

            await updateDoc(taskRef, {
                completed: newStatus, 
                completedAt: newStatus ? new Date().toISOString() : null, 
                timeSpent: task.timeSpent || 0,
            });
            const updatedTasks = tasks.map(t => 
                t.id == task.id ? { ...t, completed: !t.completed, completedAt: !task.completed ? new Date().toISOString() : null } : t
            );
            setTasks(updatedTasks);
            categorizeTasks(updatedTasks);
            //Verify the update 
            const updatedTaskDoc = await getDoc(taskRef);

            const updatedStats = calculateStats(updatedTasks);
            setStats(updatedStats);

            if(newStatus){
                const {points: updatedPoints, xp: updatedXp} = await updateUserRewards(task);
                console.log("Updated points:", updatedPoints);
                setPoints(updatedPoints);
                setXp(updatedXp);
            }
            // fetchTasks();
        }catch(error){
            console.error("Error updating tasks:", error);
        }
       
    };

    const getTasksCompletedThisWeek = (tasks) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const taskCompletionData = Array(7).fill(0); // Array to hold counts for each day of the week
    
        tasks.forEach(task => {
            if (task.completed) {
                const dayOfWeek = moment(task.completedAt).day(); // Get the day of the week (0-6)
                taskCompletionData[dayOfWeek]++;
            }
        });
    
        return taskCompletionData;
    };
    const taskCompletionData = getTasksCompletedThisWeek(tasks);
    
    
    const getTimeSpentThisWeek = (tasks) => {
        const timeSpentData = Array(7).fill(0); // Array to hold total time spent for each day of the week
    
        tasks.forEach(task => {
            if (task.completed && task.timeSpent) {
                const dayOfWeek = moment(task.completedAt).day(); // Get the day of the week (0-6)
                timeSpentData[dayOfWeek] += task.timeSpent; // Add time spent on this task to the relevant day
            }
        });
    
        return timeSpentData;
    };
    const timeSpentData = getTimeSpentThisWeek(tasks);


    const chartLabels= ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]



    return(
        <>
            <StatusBar barStyle='light-content'/>
            <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
                <Header
                    username={username}
                    menuVisible={menuVisible}
                    handleToggleMenu={() => setMenuVisible(!menuVisible)}
                    handleMenuItemClick={(item) => console.log(item)}
                    toggleTheme={toggleTheme}
                />
                <View style={styles.mainContainer}>
                    <Text variant="displaySmall" style={[ styles.heading, { color: theme.colors.primary }]}> Today </Text>
                    <TaskList
                        tasks={todayTasks}
                        handleTaskPress={handleTaskPress}
                        handleEditTask={handleEditTask}
                        handleTaskComplete={handleTaskComplete}
                    />

                    <Divider style={{backgroundColor:theme.colors.border, height: 2 }} />

                    <Text variant="displaySmall" style={[ styles.heading, { color: theme.colors.primary }]}> Upcoming </Text>
                    <TaskList
                        tasks={otherTasks}
                        handleTaskPress={handleTaskPress}
                        handleEditTask={handleEditTask}
                        handleTaskComplete={handleTaskComplete}
                    />

                    <Divider style={{backgroundColor: theme.colors.border, height: 2 }} />

                    <Text variant="displaySmall" style={[ styles.headingStats, { color: theme.colors.primary }]}>Personal Stats</Text>
                    <Stats stats={stats} />
                </View>
                <Chart 
                    taskCompletionData = {taskCompletionData}
                    timeSpentData={timeSpentData} 
                    label={chartLabels}
                />      

                {selectedTask && (
                    <Modal
                        visible={isModalVisible}
                        transparent={true}
                        animationType="slide"
                        statusBarTranslucent={true}
                    >
                        <View style={styles.modalContainer}>
                            <View style={[styles.modalContent, {backgroundColor: theme.colors.surface}]}>
                                <Text style={[styles.modalTitle, {color: theme.colors.primaryAlt}]}> {selectedTask.title} </Text>
                                <Text style={[ styles.modalText, { color: theme.colors.textAlt }]}>Description: {selectedTask.description}</Text>
                                <Text style={[ styles.modalText, { color: theme.colors.textAlt }]}>Deadline: {selectedTask.deadline}</Text>
                                <Text style={[ styles.modalText, { color: theme.colors.textAlt }]}>Priority: {selectedTask.selectedPriority}</Text>
                                <Text style={[ styles.modalText, { color: theme.colors.textAlt }]}>Category: {selectedTask.category}</Text>
                                <Text style={[ styles.modalText, { color: theme.colors.textAlt }]}>Subtasks:</Text>
                                {selectedTask.subtasks.map((subtask, index) => (
                                    <Text key={index} style={[ styles.modalText, { color: theme.colors.textAlt }]}> {subtask.text} - {subtask.checked ? 'Done' : 'Not Done'} </Text>
                                ))}
                                <TouchableOpacity onPress={handleCloseModal}>
                                    <Text style={[styles.closeModal, {color: theme.colors.primaryAlt}]}> Close </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </Modal>
                )}

            </ScrollView>
        </>      
    );

}



const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    mainContainer:{
        padding: 5,
    },
    heading:{
        fontFamily: 'PlayfairDisplay-Bold',
        fontSize: 30,
        marginBottom: 10,
    },
    headingStats:{
        fontFamily: 'PlayfairDisplay-Bold',
        fontSize: 30,
        marginVertical: 10,
    },
    modalContainer: { //using this
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: { //using this
        alignItems: 'center',
        width: Dimensions.get('window').width - 40,
        padding: 20,
        borderRadius: 50,
    },
    modalTitle: { //using this
        fontFamily: 'PlayfairDisplay-Bold',
        fontSize: 24,
        marginBottom: 10,
    },
    modalText:{
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        marginBottom: 5,
    },
    closeModal: {
        fontFamily: 'Montserrat-SemiBold',
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
    },
});

