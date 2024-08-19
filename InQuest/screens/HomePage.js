//this is the homepage after refractoring

import React, {useState, useEffect, useRef}  from "react";
import { ScrollView, View, StatusBar, Modal, StyleSheet, Dimensions, TouchableOpacity} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import moment from "moment";
// import Svg, {Circle} from "react-native-svg";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { 
    Menu, PaperProvider, 
    Appbar, Avatar, Card, 
    Text, Checkbox, IconButton,
    TouchableRipple, 
    Divider, FAB,
} from 'react-native-paper';
import { collection, getDocs, updateDoc, doc, getDoc, query, where, increment, onSnapshot } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import TaskList from "../homeComponents/TaskList";
import Stats from "../homeComponents/Stats";
import { calculateStats } from "../homeComponents/Stats";
import Header from "../homeComponents/Header";
import Chart from "../homeComponents/Chart";
import TaskCard from "../homeComponents/TaskCard";
import { updateUserRewards } from "../rewardSystem/Points";


export default function HomePage(){
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
    const user = FIREBASE_AUTH.currentUser;

    // const theme = useTheme();

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

            // console.log('Fetched tasks', tasksList);
            setTasks(tasksList);
            categorizeTasks(tasksList);

            // Calculate and update stats
            // const calculatedStats = calculateStats(tasksList);
            // setStats(calculatedStats);
        }
    };

    const fetchUserData = async () => { //This is the original 
        const user = FIREBASE_AUTH.currentUser;
        if(user){
            const userDoc = await getDoc(doc(FIRESTORE_DB, "users", user.uid));
            if(userDoc.exists()){
                const userData = userDoc.data();
                setUsername(userData.username);

                // let{points: userPoints=0, xp: userXp=0} = userData; //possible glitching
                // if(userPoints >= 20){
                //     userPoints = userPoints - 20;
                // }
                // if(userXp >= 5){
                //     userXp = userXp - 5;
                // }
                // setPoints(userPoints);
                // setXp(userXp);
                // await updateDoc(doc(FIRESTORE_DB, "users", user.uid), {
                //     points: userPoints,
                //     xp: userXp,
                // });
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
            // calculateStats();
        }   
    }, [isFocused, tasks]);
    {/** End of specific user code */}    

    const categorizeTasks = (tasks) => {
        const today = moment().startOf('day');
        const threeDaysFromNow = moment().add(3, 'days').endOf('day');
    
        // console.log(`Today: ${today.format()}`);
        // console.log(`Three Days From Now: ${threeDaysFromNow.format()}`);
        
        
        const todayTasks = tasks.filter(task => { //2nd method
            if(task.completed){
                return false;
            }
            // console.log(`Task Deadline for Today: ${task.deadline}`);
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
            // console.log(`Task Deadline for Other: ${task.deadline}`);
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

    // const handleTaskComplete = async(task) => { //This is the original 
    //     try{
    //         // //Update the task's completed status in Firestore 
    //         // const taskRef = doc(FIRESTORE_DB, 'tasks', task.id);
    //         // await updateDoc(taskRef, {completed: !task.completed, completedAt: newStatus ? new Date().toISOString() : null,  timeSpent: task.timeSpent || 0});
    //         // // await updateDoc(taskRef, {checked: !task.checked});

    //         // //Re-fetch tasks and categorise them again 
    //         // fetchTasks();


    //         const newStatus = !task.completed;
    //         const taskRef = doc(FIRESTORE_DB, 'tasks', task.id);
    //         const taskDoc = await getDoc(taskRef);
    //         const taskData = taskDoc.data();

    //         // console.log("Task data before update:", taskData);

    //         await updateDoc(taskRef, {
    //             completed: newStatus, 
    //             completedAt: newStatus ? new Date().toISOString() : null, 
    //             timeSpent: task.timeSpent || 0,
    //         });
    //         const updatedTasks = tasks.map(t => 
    //             t.id == task.id ? { ...t, completed: !t.completed, completedAt: !task.completed ? new Date().toISOString() : null } : t
    //         );
    //         setTasks(updatedTasks);
    //         categorizeTasks(updatedTasks);
    //         //Verify the update 
    //         const updatedTaskDoc = await getDoc(taskRef);
    //         // console.log("Task data after update:", updatedTaskDoc.data());

    //         const updatedStats = calculateStats(updatedTasks);
    //         setStats(updatedStats);

    //         if(newStatus){
    //             const {points: updatedPoints, xp: updatedXp} = await updateUserRewards(task);
    //             // let finalPoints = updatedPoints; //possible glitching
    //             // let finalXp = updatedXp;
    //             // if(finalPoints >= 20){
    //             //     finalPoints = finalPoints - 20;
    //             // }
    //             // if(finalXp >= 5){
    //             //     finalXp = finalXp - 5;
    //             // }
    //             // setPoints(finalPoints);
    //             // setXp(finalXp);
    //             setPoints(updatedPoints);
    //             setXp(updatedXp);
    //         }
    //         // fetchTasks();
    //     }catch(error){
    //         console.error("Error updating tasks:", error);
    //     }
       
    // };

    const handleTaskComplete = async(task) => { 
        try{
            // //Update the task's completed status in Firestore 
            // const taskRef = doc(FIRESTORE_DB, 'tasks', task.id);
            // await updateDoc(taskRef, {completed: !task.completed, completedAt: newStatus ? new Date().toISOString() : null,  timeSpent: task.timeSpent || 0});
            // // await updateDoc(taskRef, {checked: !task.checked});

            // //Re-fetch tasks and categorise them again 
            // fetchTasks();


            const newStatus = !task.completed;
            const taskRef = doc(FIRESTORE_DB, 'tasks', task.id);
            const taskDoc = await getDoc(taskRef);
            const taskData = taskDoc.data();

            // console.log("Task data before update:", taskData);

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
            // console.log("Task data after update:", updatedTaskDoc.data());

            const updatedStats = calculateStats(updatedTasks);
            setStats(updatedStats);

            if(newStatus){
                const {points: updatedPoints, xp: updatedXp} = await updateUserRewards(task);
                console.log("Updated points:", updatedPoints);
                // let finalPoints = updatedPoints; //possible glitching
                // let finalXp = updatedXp;
                // if(finalPoints >= 20){
                //     finalPoints = finalPoints - 20;
                // }
                // if(finalXp >= 5){
                //     finalXp = finalXp - 5;
                // }
                // setPoints(finalPoints);
                // setXp(finalXp);
                setPoints(updatedPoints);
                setXp(updatedXp);
            }
            // fetchTasks();
        }catch(error){
            console.error("Error updating tasks:", error);
        }
       
    };

    // const renderTask = ({ item }) => {
    //     const completedSubtasks = item.subtasks ? item.subtasks.filter(subtask => subtask.checked).length : 0;
    //     const totalSubtasks = item.subtasks ? item.subtasks.length : 0;
    //     const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;


    //     return(
    //         <TouchableRipple onPress={() => handleTaskPress(item)} rippleColor="rgba(0, 0, 0, .32)">
    //             <View style={styles.innerShadowContainer}>
    //                 <Card onPress={() => handleTaskPress(item)} style={styles.card}>
    //                     <View style={styles.cardHeader}>
    //                         <Card.Title title={item.title} titleVariant="titleLarge" titleStyle={styles.cardTitle} /> 
    //                         <IconButton
    //                             icon="pencil-outline"
    //                             size={20}
    //                             color="#93B1A6"
    //                             onPress={() => handleEditTask(item)}
    //                         />
    //                     </View>
    //                     <Card.Content>
    //                         <Text variant="bodyMedium" style={styles.cardText}> Priority: {item.selectedPriority} </Text>
    //                         <Text variant="bodyMedium" style={styles.cardText}> Category: {item.category}</Text>
    //                         <Text variant="bodyMedium" style={styles.cardText}> Deadline: {item.deadline}</Text>
    //                         <View style={styles.bottomRow}>
    //                             {totalSubtasks > 0 && (
    //                                 <AnimatedCircularProgress
    //                                     size={40}
    //                                     width={4}
    //                                     backgroundColor="#5C8374"
    //                                     fill={Math.round(progress)}
    //                                     tintColor="black" //color of the progress line 
    //                                     text = {Math.round(progress)}
    //                                 >
    //                                     {
    //                                         (fill) => <Text style={styles.progressText}> {Math.round(progress)} %</Text>
                                            
    //                                     }
    //                                 </AnimatedCircularProgress>
    //                             )}
    //                             <Checkbox
    //                                 status={item.completed ? 'checked' : 'unchecked'}
    //                                 onPress={() => {handleTaskComplete(item)}}
    //                                 color="#5C8374"
    //                             />
    //                         </View>
    //                     </Card.Content>
    //                 </Card>
    //             </View>
    //         </TouchableRipple>
    //     );
    // }

  

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
        <PaperProvider>
            <StatusBar barStyle='light-content'/>
            <ScrollView style={styles.container}>
                <Header
                    username={username}
                    menuVisible={menuVisible}
                    handleToggleMenu={() => setMenuVisible(!menuVisible)}
                    handleMenuItemClick={(item) => console.log(item)}
                />
                <Text style={styles.statLabel}>Points: {points}</Text>
                <Text style={styles.statLabel}>XP: {xp}</Text>
                <View style={styles.mainContainer}>
                    <Text variant="displaySmall" style={{ color: '#93B1A6', fontSize: 34, marginBottom: 10 }}> Today </Text>
                    <TaskList
                        tasks={todayTasks}
                        handleTaskPress={handleTaskPress}
                        handleEditTask={handleEditTask}
                        handleTaskComplete={handleTaskComplete}
                    />

                    <Divider style={{backgroundColor: '#5C8374', height: 2 }} />

                    <Text variant="displaySmall" style={{ color: '#93B1A6', fontSize: 34, marginBottom: 10 }}> Upcoming </Text>
                    <TaskList
                        tasks={otherTasks}
                        handleTaskPress={handleTaskPress}
                        handleEditTask={handleEditTask}
                        handleTaskComplete={handleTaskComplete}
                    />

                    <Divider style={{backgroundColor: '#5C8374', height: 2 }} />

                    <Text variant="displaySmall" style={{ color: '#93B1A6', fontSize: 34, marginVertical: 10 }}>Personal Stats</Text>
                    <Stats stats={stats} />
                </View>
                <Chart 
                        taskCompletionData = {taskCompletionData}
                        timeSpentData={timeSpentData} 
                        label={chartLabels}
                    /> 
                {/* <Chart data = {timeSpentData} label={chartLabels}/> */}

                {selectedTask && (
                    <Modal
                        visible={isModalVisible}
                        transparent={true}
                        animationType="slide"
                        statusBarTranslucent={true}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}> {selectedTask.title} </Text>
                                <Text style={{ color: '#93B1A6' }}>Description: {selectedTask.description}</Text>
                                <Text style={{ color: '#93B1A6' }}>Deadline: {selectedTask.deadline}</Text>
                                <Text style={{ color: '#93B1A6' }}>Priority: {selectedTask.selectedPriority}</Text>
                                <Text style={{ color: '#93B1A6' }}>Category: {selectedTask.category}</Text>
                                <Text style={{ color: '#93B1A6' }}>Subtasks:</Text>
                                {selectedTask.subtasks.map((subtask, index) => (
                                    <Text key={index} style={{ color: '#93B1A6' }}> {subtask.text} - {subtask.checked ? 'Done' : 'Not Done'} </Text>
                                ))}
                                <TouchableOpacity onPress={handleCloseModal}>
                                    <Text style={styles.closeModal}> Close </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </Modal>
                )}

            </ScrollView>
        </PaperProvider>
      
    );

}



const styles = StyleSheet.create({
    container:{
        flex: 1, 
        // padding: 5,
        // backgroundColor: '#040D12',
        // backgroundColor: theme.colors.secondary
    },
    mainContainer:{
        padding: 5,
    },
    modalContainer: { //using this
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: { //using this
        // width: '80%',
        // backgroundColor: '#fff',
        // borderRadius: 10,
        // padding: 20,
        // alignItems: 'center',

        width: Dimensions.get('window').width - 40,
        // backgroundColor: '#183D3D',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: { //using this
        // fontSize: 18,
        // fontWeight: 'bold',
        // marginBottom: 10,

        fontSize: 20,
        fontWeight: 'bold',
        // color: '#93B1A6',
        marginBottom: 10,
    },
    closeModal: {
        // color: '#5C8374',
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
    },
});

