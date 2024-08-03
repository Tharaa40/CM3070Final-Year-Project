import React, {useState, useEffect, useRef}  from "react";
import { 
    ScrollView, 
    View,
    TouchableOpacity, 
    StyleSheet, Modal, 
    FlatList, 
    StatusBar, 
    Animated
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused, useNavigation } from "@react-navigation/native";
import moment from "moment";
import Svg, {Circle} from "react-native-svg";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { 
    Menu, PaperProvider, 
    Appbar, Avatar, Card, 
    Text, Checkbox, IconButton,
    TouchableRipple, 
    Divider
} from 'react-native-paper';
import AvatarImg from '../assets/assetsPack/BasicCharakterActions.png'

import { collection, getDocs, updateDoc, doc, getDoc, query, where } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../firebaseConfig";

export default function HomePage(){
    const [tasks, setTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [otherTasks, setOtherTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const animation = useRef(new Animated.Value(0)).current;
    const [checked, setChecked] = useState(false);
    // console.log('checked: ', checked);

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
            screen: 'CreateTask',
            params: {task}
        });
        // navigation.navigate('CreateTask', { task });
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
            await updateDoc(taskRef, {completed: !task.completed});

            //Re-fetch tasks and categorise them again 
            const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'tasks'));
            const tasksData = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id }));
            setTasks(tasksData);
            categorizeTasks(tasksData);
        }catch(error){
            console.error("Error updating tasks:", error);
        }
    };

    const renderTask = ({ item }) => {
        const completedSubtasks = item.subtasks ? item.subtasks.filter(subtask => subtask.checked).length : 0;
        const totalSubtasks = item.subtasks ? item.subtasks.length : 0;
        const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

        

        // return (
        //     <TouchableOpacity style={styles.taskCard} onPress={() => handleTaskPress(item)}>
        //         <Text style={styles.taskTitle}>{item.title}</Text>
        //         <Text style={styles.taskPriority}>{item.selectedPriority}</Text>
        //         <Text style={styles.taskCategory}>{item.category}</Text>
        //         <Text style={styles.taskDeadline}>{item.deadline}</Text>
        //         <View style={styles.bottomRow}>
        //             {totalSubtasks > 0 && (
        //                 <View style={styles.progressCircleContainer}>
        //                     <Svg height="40" width="40" viewBox="0 0 40 40">
        //                         <Circle
        //                             cx="20"
        //                             cy="20"
        //                             r="18"
        //                             stroke="#d3d3d3"
        //                             strokeWidth="4"
        //                             fill="none"   
        //                         />
        //                         <Circle
        //                             cx="20"
        //                             cy="20"
        //                             r="18"
        //                             stroke="#4CAF50"
        //                             strokeWidth="4"
        //                             fill="none"
        //                             strokeDasharray={`${2 * Math.PI * 18}`}
        //                             strokeDashoffset={`${2 * Math.PI * 18 * ((100 - progress) / 100)}`}
        //                         />
        //                     </Svg>
        //                     <View style={styles.progressInnerCircle}>
        //                         <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        //                     </View>
        //                 </View>
        //             )}
        //             <TouchableOpacity
        //                 style={[styles.checkbox, item.completed && styles.checkboxCompleted]}
        //                 onPress={() => handleTaskComplete(item)}
        //             >
        //                 {item.completed && <Icon name="check" size={16} color="#fff" />}
        //             </TouchableOpacity>
        //         </View>

        //         <TouchableOpacity style={styles.editIcon} onPress={() => handleEditTask(item)}>
        //             <Icon name="edit" size={20} color="#000" />
        //         </TouchableOpacity>
        //     </TouchableOpacity>
        // );
        
        

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
                                    status={item.checked ? 'checked' : 'unchecked'}
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

    const toggleMenu = () => {
        if(menuVisible){
            Animated.timing(animation, {
                toValue: 0, 
                duration: 300, 
                useNativeDriver: true, 
            }).start(() => setMenuVisible(false));
        }else{
            setMenuVisible(true);
            Animated.timing(animation, {
                toValue: 1, 
                duration: 300, 
                useNativeDriver: true, 
            }).start();
        }
    };

    const animatedStyle = {
        transform: [
            {
                scale: animation.interpolate({
                    inputRange: [0,1],
                    outputRange: [0.5, 1],
                }),
            },
        ],
        opacity: animation,
    }

    return(
        <PaperProvider>
            <ScrollView style={styles.container}>
                <StatusBar 
                    backgroundColor='navy'
                    animated={true}            
                />
               
                <Appbar.Header style={styles.headerContainer}>
                    <Appbar.Content title= {`Hello, ${username}`} />
                    {/* <Avatar.Icon size={30} icon="account-outline" /> */}
                    <Avatar.Image size={50} source={AvatarImg}  />
                    <Appbar.Action icon='dots-vertical' onPress={() => {toggleMenu}} />
                    {/* <Text style={styles.header}> Hello, {username} </Text> */}
                </Appbar.Header>
                
                
                <Text variant="displaySmall"> Today </Text>
                <FlatList
                    data={todayTasks}
                    renderItem={renderTask}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text>No tasks for today.</Text>}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{paddingBottom: 10}}
                />

                <Divider style={{backgroundColor: 'red'}} />

                <Text style={styles.header} variant="displaySmall">Others</Text>
                <FlatList
                    data={otherTasks}
                    renderItem={renderTask}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text>No other tasks.</Text>}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{paddingBottom: 10}}
                />  
                <Divider style={{backgroundColor: 'red'}} />

                {menuVisible && (
                    <Animated.View style={[styles.menuContainer, animatedStyle]}>
                        <Menu
                            visible={menuVisible}
                            onDismiss={toggleMenu}
                            anchor={{x: 200, y: 50}}
                        >
                            <Menu.Item onPress={() => {}} title="Avatar" icon="account-circle"/>
                            <Menu.Item onPress={() => {}} title="Theme" icon="theme-light-dark"/>
                            <Menu.Item onPress={() => {}} title="Sound" icon="volume-high"/>
                            <Menu.Item onPress={() => {}} title="Dark/Light" icon="bell"/>
                        </Menu>
                    </Animated.View>
                )}

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
                                <Text>Description: {selectedTask.description}</Text>
                                <Text>Deadline: {selectedTask.deadline}</Text>
                                <Text>Priority: {selectedTask.selectedPriority}</Text>
                                <Text>Category: {selectedTask.category}</Text>
                                <Text>Subtasks:</Text>
                                {selectedTask.subtasks.map((subtask, index) => (
                                    <Text key={index}> {subtask.text} - {subtask.checked ? 'Done' : 'Not Done'} </Text>
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
    container: {
        flex: 1,
        marginLeft: 10,
        marginTop: 5,
        // backgroundColor: 'pink'
        // paddingHorizontal: 10,
        // paddingVertical: 20,
        // padding: 20,
        // backgroundColor: '#fff',
    },

    cardHeader:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems: 'center',
        paddingRight: 8
    },
    bottomRow:{ //using this
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    progressText:{
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    innerShadowContainer:{
        shadowColor: '#000',
        shadowOffset: { width: -2, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        backgroundColor: '#183D3D',
        borderRadius: 8,
        marginRight: 10
    },
    card: {
        backgroundColor: '#183D3D'
    },
    cardTitle:{
        color: '#93B1A6'
    },
    cardText: {
        color: '#93B1A6',
    },
    headerContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems: 'center',
        // paddingHorizontal: 15,
        backgroundColor: 'yellow'
        // padding: 16,
        // backgroundColor: '#f8f8f8',
    },
    // header: {
    //     fontSize: 24,
    //     fontWeight: 'bold',
    //     marginBottom: 10,
    // },
      
    menuContainer:{
        position: 'absolute',
        top: 50, 
        right: 10, 
        zIndex: 1,
    },
   
   
    // taskCard: {
    //     backgroundColor: '#f8f8f8',
    //     padding: 15,
    //     borderRadius: 10,
    //     marginBottom: 10,
    //     position: 'relative',
    // },
    // taskTitle: {
    //     fontSize: 18,
    //     fontWeight: 'bold',
    // },
    // taskPriority: {
    //     fontSize: 16,
    //     color: '#888',
    // },
    // taskCategory: {
    //     fontSize: 16,
    //     color: '#888',
    // },
    // taskDeadline: {
    //     fontSize: 16,
    //     color: '#888',
    // },
    // progressCircleContainer:{
    //     position: 'relative',
    //     justifyContent: 'center',
    //     alignItems: 'center'
    // },
    // progressInnerCircle:{
    //     position: 'absolute',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    // },
   
    // checkbox:{
    //     width: 24,
    //     height: 24,
    //     borderRadius: 12,
    //     borderWidth: 2,
    //     borderColor: '#d3d3d3',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    // },
    // checkboxCompleted:{
    //     backgroundColor: '#4CAF50',
    //     borderColor: '#4CAF50',
    // },
    // editIcon: {
    //     position: 'absolute',
    //     top: 10,
    //     right: 10,
    // },


    
});
