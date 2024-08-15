import React, {useState, useEffect, useRef}  from "react";
import { ScrollView, View, StatusBar,} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import moment from "moment";
// import Svg, {Circle} from "react-native-svg";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { 
    Menu, PaperProvider, 
    Appbar, Avatar, Card, 
    Text, Checkbox, IconButton,
    TouchableRipple, 
    Divider, FAB
} from 'react-native-paper';
import { collection, getDocs, updateDoc, doc, getDoc, query, where } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";
import TaskList from "../homeComponents/TaskList";
import Stats from "../homeComponents/Stats";
import { calculateStats } from "../homeComponents/Stats";
import Header from "../homeComponents/Header";
import Chart from "../homeComponents/Chart";





export default function HomePage(){
    const [tasks, setTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [otherTasks, setOtherTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [calculatedStats, setCalculatedStats] = useState({});

    const navigation = useNavigation();
    const isFocused = useIsFocused();
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

            // console.log('Fetched tasks', tasksList);
            setTasks(tasksList);
            categorizeTasks(tasksList);

            // Calculate and update stats
            // const calculatedStats = calculateStats(tasksList);
            // setStats(calculatedStats);
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
            <ScrollView>
                <StatusBar barStyle='light-content'/>
                <Header
                    username={username}
                    menuVisible={menuVisible}
                    handleToggleMenu={() => setMenuVisible(!menuVisible)}
                    handleMenuItemClick={(item) => console.log(item)}
                />
                
                <Text variant="displaySmall" style={{ color: '#93B1A6', fontSize: 34, marginBottom: 10 }}> Today </Text>
                <TaskList
                    tasks={todayTasks}
                    handleTaskPress={handleTaskPress}
                    handleEditTask={handleEditTask}
                    handleTaskComplete={handleTaskComplete}
                />

                <Text variant="displaySmall" style={{ color: '#93B1A6', fontSize: 34, marginBottom: 10 }}> Upcoming </Text>
                <TaskList
                    tasks={otherTasks}
                    handleTaskPress={handleTaskPress}
                    handleEditTask={handleEditTask}
                    handleTaskComplete={handleTaskComplete}
                />
                <Stats stats={stats} />
                <Chart 
                    taskCompletionData = {taskCompletionData}
                    timeSpentData={timeSpentData} 
                    label={chartLabels}
                />
                {/* <Chart data = {timeSpentData} label={chartLabels}/> */}

            </ScrollView>
        </PaperProvider>
      
    );

}

