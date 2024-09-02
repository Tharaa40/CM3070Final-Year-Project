//this file is the original HomePage before refractoring 

import React, {useState, useEffect, useRef}  from "react";
import { 
    ScrollView, 
    View,
    TouchableOpacity, 
    StyleSheet, Modal, 
    FlatList, 
    StatusBar, Dimensions
} from "react-native";
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
import { LineChart, BarChart } from "react-native-chart-kit";
// import AvatarImg from '../assets/assetsPack/BasicCharakterActions.png'
import AvatarImg from '../assets/assetsPack/char_walk_left.gif';

import { collection, getDocs, updateDoc, doc, getDoc, query, where } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";


const calculateStats = (tasks) => {
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



export default function HomePage2(){ 
    const [tasks, setTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [otherTasks, setOtherTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);


    const navigation = useNavigation();
    const isFocused = useIsFocused();
    // const animationValue = useSharedValue(0); 
    // const fadeAnim = useRef(new Animated.Value(0)).current;
    // const [checked, setChecked] = useState(false);
    const handleToggleMenu = () => setMenuVisible(!menuVisible);
    const handleCloseMenu = () => setVisible(false);


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
        const user = FIREBASE_AUTH.currentUser;
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

            // Calculate and update stats
            const calculatedStats = calculateStats(tasksList);
            setStats(calculatedStats);
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
        }   
    }, [isFocused]);
    {/** End of specific user code */}


    const categorizeTasks = (tasks) => {
        const today = moment().startOf('day');
        const threeDaysFromNow = moment().add(3, 'days').endOf('day');
    
        console.log(`Today: ${today.format()}`);
        console.log(`Three Days From Now: ${threeDaysFromNow.format()}`);
        
        
        const todayTasks = tasks.filter(task => { //2nd method
            if(task.completed){
                return false;
            }
            console.log(`Task Deadline for Today: ${task.deadline}`);
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
            console.log(`Task Deadline for Other: ${task.deadline}`);
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
            //Update the task's completed status in Firestore 
            const taskRef = doc(FIRESTORE_DB, 'tasks', task.id);
            await updateDoc(taskRef, {completed: !task.completed, completedAt: newStatus ? new Date().toISOString() : null,  timeSpent: task.timeSpent || 0});
            // await updateDoc(taskRef, {checked: !task.checked});

            //Re-fetch tasks and categorise them again 
            // const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'tasks')); //previous method 
            // const tasksData = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id })); //previous method 
            // setTasks(tasksData); //previous method 
            // categorizeTasks(tasksData); //previous method 
            fetchTasks();
        }catch(error){
            console.error("Error updating tasks:", error);
        }
    };

    const renderTask = ({ item }) => {
        const completedSubtasks = item.subtasks ? item.subtasks.filter(subtask => subtask.checked).length : 0;
        const totalSubtasks = item.subtasks ? item.subtasks.length : 0;
        const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;


        return(
            <TouchableRipple onPress={() => handleTaskPress(item)} rippleColor="rgba(0, 0, 0, .32)">
                <View style={styles.innerShadowContainer}>
                    <Card onPress={() => handleTaskPress(item)} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Card.Title title={item.title} titleVariant="titleLarge" titleStyle={styles.cardTitle} /> 
                            <IconButton
                                icon="pencil-outline"
                                size={20}
                                color="#93B1A6"
                                onPress={() => handleEditTask(item)}
                            />
                        </View>
                        <Card.Content>
                            <Text variant="bodyMedium" style={styles.cardText}> Priority: {item.selectedPriority} </Text>
                            <Text variant="bodyMedium" style={styles.cardText}> Category: {item.category}</Text>
                            <Text variant="bodyMedium" style={styles.cardText}> Deadline: {item.deadline}</Text>
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
                                    status={item.completed ? 'checked' : 'unchecked'}
                                    onPress={() => {handleTaskComplete(item)}}
                                    color="#5C8374"
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </View>
            </TouchableRipple>
        );
    }

    // const toggleTheme = () => {
    //     setMenuVisible(!menuVisible);
    // }; 
    // const navigateSettings = () => {
    //     console.log('navigate to settings');
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





    return(
        <PaperProvider>
            <StatusBar 
                backgroundColor='navy'
                animated={true}            
            />
            <ScrollView style={styles.container}>
                <Appbar.Header style={styles.headerContainer}>
                    <View style={styles.headerContent}> 
                        <Appbar.Content title= {`Hello, ${username}`} />
                        <Avatar.Image size={50} source={AvatarImg} style={styles.avatar}  />
                        {/* <Appbar.Action icon='dots-vertical' onPress={toggleMenu} /> */}
                        <Menu
                            visible={menuVisible}
                            onDismiss={handleToggleMenu}
                            anchor={
                                <Appbar.Action
                                    icon='dots-vertical'
                                    color="black"
                                    onPress={handleToggleMenu}
                                />
                            }
                        >
                            <Menu.Item
                                onPress={() => {
                                    console.log("Toggle theme pressed");
                                    handleToggleMenu();
                                }}
                                title='Toggle theme'
                                leadingIcon='theme-light-dark'
                            />
                            <Menu.Item
                                onPress={() => navigation.navigate('Settings')}
                                title='Settings'
                                leadingIcon='cog-outline'
                            />


                        </Menu>
                        
                    </View>
                    
                    {/* <Avatar.Icon size={30} icon="account-outline" /> */}
                    {/* <Text style={styles.header}> Hello, {username} </Text> */}
                </Appbar.Header>
                
                <Text variant="displaySmall" style={{ color: '#93B1A6', fontSize: 34, marginBottom: 10 }}> Today </Text>
                <FlatList
                    data={todayTasks}
                    renderItem={renderTask}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={{ color: '#93B1A6', marginHorizontal: 10 }}>No tasks for today.</Text>}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{paddingBottom: 20}}
                />

                <Divider style={{backgroundColor: '#5C8374', height: 2}} />

                <Text variant="displaySmall" style={{ color: '#93B1A6', fontSize: 34, marginHorizontal: 10 }}>Others</Text>
                <FlatList
                    data={otherTasks}
                    renderItem={renderTask}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={{ color: '#93B1A6', marginHorizontal: 12 }}>No other tasks.</Text>}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{paddingBottom: 10}}
                />  
                <Divider style={{ backgroundColor: '#5C8374', height: 2 }} />

                {/* {menuVisible && (
                    <View style={styles.menuContainer}>
                        <Menu
                            visible={menuVisible}
                            onDismiss={toggleMenu}
                            anchor={
                                // <TouchableOpacity onPress={toggleMenu}>
                                    <Appbar.Action icon="dots-vertical" color="white" />
                                // /TouchableOpacity> 
                            }
                        >
                            <Menu.Item
                                onPress={() => {
                                    navigation.navigate('Timer')
                                }}
                                title="Toggle Light/Dark Mode"
                                leadingIcon="theme-light-dark"
                            />
                            <Menu.Item
                                onPress={() => console.log('Settings pressed')}
                                title="Settings"
                                leadingIcon="cog-outline"
                            />
                        </Menu>
                    </View>
                )} */}

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



                <Text variant="displaySmall" style={{ color: '#93B1A6', fontSize: 34, marginVertical: 10 }}>Personal Stats</Text>
                <View style={styles.statsContainer}>
                    <Text style={styles.statLabel}>Total Tasks: {stats.totalTasks}</Text>
                    <Text style={styles.statLabel}>Completed Tasks: {stats.completedTasks}</Text>
                    <Text style={styles.statLabel}>Remaining Tasks: {stats.remainingTasks}</Text>
                    <Text style={styles.statLabel}>Completion Rate: {Math.round(stats.completionRate)}%</Text>
                    <Text style={styles.statLabel}>Tasks Completed This Week: {stats.tasksCompletedThisWeek}</Text>
                    <Text style={styles.statLabel}>Average Time Spent per Task: {Math.round(stats.averageTimeSpentPerTask)} mins</Text>
                    <Text style={styles.statLabel}>Productivity Streak: {stats.streaks} days</Text>
                    
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={{
                                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                                datasets: [{ data: taskCompletionData}]
                            }}
                            width={Dimensions.get('window').width - 30}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=" tasks"
                            chartConfig={{
                                backgroundColor: "#e26a00",
                                backgroundGradientFrom: "#fb8c00",
                                backgroundGradientTo: "#ffa726",
                                decimalPlaces: 2, // optional, defaults to 2dp
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: "#ffa726"
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                        <BarChart
                            data={{
                                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                                datasets: [
                                    {
                                        data: timeSpentData // Example data, replace with real task data
                                    }
                                ]
                            }}
                            width={Dimensions.get("window").width - 30}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=" mins"
                            chartConfig={{
                                backgroundColor: "#e26a00",
                                backgroundGradientFrom: "#fb8c00",
                                backgroundGradientTo: "#ffa726",
                                decimalPlaces: 2, 
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "6",
                                    strokeWidth: "2",
                                    stroke: "#ffa726"
                                }
                            }}
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    </View>
                </View>

            </ScrollView>
        </PaperProvider>
    );

}

const styles = StyleSheet.create({
    container: { //using this
        flex: 1,
        // backgroundColor: '#040D12',
        padding: 5
        // marginLeft: 6,
        // marginTop: 5,
    },
    headerContainer:{ //using this
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        // backgroundColor: '#183D3D',
        // marginRight: 5

        // backgroundColor: '#183D3D',
        paddingVertical: 10,
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#5C8374',
    },
    headerContent:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginLeft: 10,
    },
    // sectionHeader:{
    //     color: '#93B1A6',
    //     marginBottom: 10,
    //     fontSize: 34
    // },

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

    menuContainer: {
        position: 'absolute',
        top: 60,
        right: 10,
        zIndex: 1000,
    },


    modalContainer: { //using this
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: { //using this
        // width: '80%',
        // backgroundColor: '#fff',
        // borderRadius: 10,
        // padding: 20,
        // alignItems: 'center',

        width: Dimensions.get('window').width - 40,
        backgroundColor: '#183D3D',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: { //using this
        // fontSize: 18,
        // fontWeight: 'bold',
        // marginBottom: 10,

        fontSize: 20,
        fontWeight: 'bold',
        color: '#93B1A6',
        marginBottom: 10,
    },
    closeModal: {
        color: '#5C8374',
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
    },

    statsContainer:{
        marginTop: 20,
    },
    statLabel:{
        color: '#93B1A6',
        fontSize: 16,
        marginBottom: 10,
    },
    chartContainer:{
        marginTop: 20,
        backgroundColor: '#040D12',
    },

   
 
  


    
});