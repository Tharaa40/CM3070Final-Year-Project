import React, {useState, useRef, useEffect} from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Pressable, Platform, Modal, Button } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker'; //Calendar and time selection
// import RNPickerSelect from 'react-native-picker-select'; //for both category and priority
import { Picker } from "@react-native-picker/picker";
import moment from "moment";

import { FIRESTORE_DB, FIREBASE_AUTH } from "../firebaseConfig";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";



export default function CreateTask({navigation, route}){

    //Firebase
    const [taskId, setTaskId] = useState(null);
    useEffect(() => {
        if (route.params?.task) {
            const { task } = route.params;
            setTitle(task.title);
            setDescription(task.description);
            setSubtasks(task.subtasks);
            setDeadline(task.deadline);
            setSelectedPriority(task.selectedPriority);
            setSelectedCategory(task.category);
            setTaskId(task.id);
        }
    }, [route.params?.task]);

    //Title, Description
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    //Subtask
    const [subtasks, setSubtasks] = useState([]);
    const addSubtask = () => {
        setSubtasks([...subtasks, { text: '', checked: false }]);
    };
    const removeSubtask = (index) => {
        const updatedSubtasks = [...subtasks];
        updatedSubtasks.splice(index, 1);
        setSubtasks(updatedSubtasks);
    };
    const toggleSubtask = (index) => {
        const updatedSubtasks = [...subtasks];
        updatedSubtasks[index].checked = !updatedSubtasks[index].checked;
        setSubtasks(updatedSubtasks);
    };

    //Deadline
    const [deadline, setDeadline] = useState('');
    const [date, setDate] = useState(new Date()); //monitoring the current date of the picker 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const toggleDatepicker = () => { //this toggles the visibility  DEADLINE - WORKING 
        // setShowPicker(!showPicker); //if it is visible, it will be hidden
        setShowDatePicker(!showDatePicker)
    };

    const toggleTimepicker = () => { //added this
        setShowTimePicker(!showTimePicker);
    }

    const onDateChange = ({type}, selectedDate) =>{ //when the value of the picker changes DEADLINE - WORKING
        if(type ==='set'){
            const currentDate = selectedDate;
            setDate(currentDate);
            if (Platform.OS === 'android'){ //Android 
                toggleDatepicker();
                setDeadline(formatDeadline(currentDate));
            }
        }else{
            toggleDatepicker();
        }
    };

    const onTimeChange = ({type}, selectedTime) => { //new
        if(type === 'set'){
            const currentTime = selectedTime;
            const updatedDate = new Date(date);
            updatedDate.setHours(currentTime.getHours());
            updatedDate.setMinutes(currentTime.getMinutes());
            setDate(updatedDate);
            if(Platform.OS === 'android'){
                toggleTimepicker();
                setDeadline(formatDeadline(updatedDate));
            }
        }else{
            toggleTimepicker();
        }
    };
    const formatDeadline = (date) => {
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const confirmIOSDate = () => { //DEADLINE - WORKING 
        setDeadline(formatDeadline(date));
        toggleDatepicker();
    };
    const confirmIOSTime = () => {
        setDeadline(formatDeadline(date));
        toggleTimepicker();
    };

    //Priority
    // const [selectedPriority, setSelectedPriority] = useState(null);
    const [priority, setPriority] = useState([
        {label: 'Low', value: 'Low'},
        {label: 'Medium', value: 'Medium'},
        {label: 'High', value: 'High'}
    ]);
    const [selectedPriority, setSelectedPriority] = useState(null);
    // const priorities = ['Low', 'Medium', 'High'];

    //Category
    const [category, setCategory] = useState([
        { label: 'Work', value: 'work' },
        { label: 'Personal', value: 'personal' },
        { label: 'Other', value: 'other' }
    ]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newTag, setNewTag] = useState('');

    const addNewTag = () => {
        if(newTag){
            setCategory([...category, { label: newTag, value: newTag.toLowerCase()}])
            setSelectedCategory(newTag.toLowerCase());
            setNewTag('');
            setIsModalVisible(false);
        }
    };

    //Save and close 
    const saveTask = async() => {
        try{
            if(taskId){
                const taskRef = doc(FIRESTORE_DB, 'tasks', taskId);
                await updateDoc(taskRef,{
                    title, 
                    description, 
                    subtasks, 
                    deadline, 
                    selectedPriority,
                    category: selectedCategory,
                    updatedAt: new Date().toISOString(),
                });
                console.log('Task updated');
            }else{
                await addDoc(collection(FIRESTORE_DB, 'tasks'), {
                    title, 
                    description, 
                    subtasks, 
                    deadline, 
                    selectedPriority,
                    category: selectedCategory, 
                    createdAt: new Date().toISOString(),
                });
                console.log('Task saved');
            }
            navigation.navigate('Details');
        }catch(error){
            console.error('Error saving task: ', error);
        }
    };

    // const saveTask = async() => {
    //     try{
    //         const user = FIREBASE_AUTH.currentUser;
    //         if(!user){
    //             throw new Error('No authenticated user found');
    //         }

    //         if(taskId){
    //             const taskRef = doc(FIRESTORE_DB, 'tasks', taskId);
    //             await updateDoc(taskRef,{
    //                 title, 
    //                 description, 
    //                 subtasks, 
    //                 deadline, 
    //                 selectedPriority,
    //                 category: selectedCategory,
    //                 updatedAt: new Date().toISOString(),
    //                 userId: user.uid,
    //             });
    //             console.log('Task updated');
    //         }else{
    //             await addDoc(collection(FIRESTORE_DB, 'tasks'), {
    //                 title, 
    //                 description, 
    //                 subtasks, 
    //                 deadline, 
    //                 selectedPriority,
    //                 category: selectedCategory, 
    //                 createdAt: new Date().toISOString(),
    //                 userId: uid,
    //             });
    //             console.log('Task saved');
    //         }
    //         navigation.navigate('Details');
    //     }catch(error){
    //         console.error('Error saving task: ', error);
    //     }
    // };

    const cancelTask = async() => {
        navigation.navigate('HomePage');
    }

   



    return(
        <View style={styles.screenContainer}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}> Add Task </Text>

                {/**Title */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}> Title </Text>
                    <TextInput
                        style = {styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder='Enter task title'
                        placeholderTextColor= '#93B1A6'
                    />
                </View>

                {/**description */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}> Description </Text>
                    <TextInput
                        style = {styles.input}
                        value={description}
                        onChangeText={setDescription}
                        placeholder='Enter task description'
                        placeholderTextColor= '#93B1A6'
                    />
                </View>

                {/**subtasks */} 
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}> Subtasks </Text>
                    {subtasks.map((subtask, index) => (
                        <View key={index} style={styles.subtaskContainer}>
                            <TouchableOpacity onPress={() => toggleSubtask(index)}>
                                <Icon
                                    name={subtask.checked ? 'check-square' : 'square-o'}
                                    size={20}
                                    color={subtask.checked ? 'green' : '#ccc'}
                                    style={styles.checkboxIcon}
                                />
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.input, {flex:1}]}
                                value={subtask.text}
                                onChangeText={(text) => {
                                    const updatedSubtasks = [...subtasks];
                                    updatedSubtasks[index].text = text;
                                    setSubtasks(updatedSubtasks);
                                }}
                                placeholder="Enter subtask"
                                placeholderTextColor='#93B1A6'
                            />
                            <TouchableOpacity onPress={() => removeSubtask(index)}>
                                <Icon name='trash' size={20} color='white' style={{margin: 10}}/>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity onPress={addSubtask} style={styles.iconButton}>
                        <Icon name='plus' size={20} color='beige' />
                    </TouchableOpacity>
                </View>

                {/**deadline */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}> Deadline </Text>
                    <View style={styles.textInputWithIcon}>
                        {showDatePicker && (
                            <DateTimePicker 
                                mode="date"
                                display="spinner"
                                value={date}
                                onChange={onDateChange}
                                style={styles.datePicker}
                            />
                        )}
                        {showTimePicker && (
                            <DateTimePicker
                                mode="time"
                                display="spinner"
                                value={date}
                                onChange={onTimeChange}
                                style={styles.datePicker}
                            />
                        )}
                        {showDatePicker && Platform.OS==='ios' && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <TouchableOpacity
                                    style={[styles.cancelDatebutton, styles.pickerButton, { backgroundColor: '#11182711' }]}
                                    onPress={toggleDatepicker}
                                >
                                    <Text style={[styles.buttonText, { color: '#075985' }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.cancelDatebutton, styles.pickerButton]}
                                    onPress={confirmIOSDate}
                                >
                                    <Text style={styles.buttonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {showTimePicker && Platform.OS==='ios' && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <TouchableOpacity
                                    style={[styles.cancelDatebutton, styles.pickerButton, { backgroundColor: '#11182711' }]}
                                    onPress={toggleTimepicker}
                                >
                                    <Text style={[styles.buttonText, { color: '#075985' }]}> Cancel </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.cancelDatebutton, styles.pickerButton]}
                                    onPress={confirmIOSTime}
                                >
                                    <Text style={styles.buttonText}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <TextInput
                            style={styles.input}
                            value={deadline}
                            onChangeText={setDeadline}
                            placeholder='Select deadline'
                            editable={false}
                            onPressIn={toggleDatepicker}
                        />
                        {!showDatePicker && !showTimePicker && (
                            <Pressable
                                style={styles.calendarIcon}
                                onPress={toggleDatepicker}
                            >
                                <Icon name='calendar' size={20} color='gray' />
                            </Pressable>
                        )}
                        {!showDatePicker && !showTimePicker && (
                            <Pressable
                                style={styles.clockIcon}
                                onPress={toggleTimepicker}
                            >
                                <Icon name='clock-o' size={20} color='gray' />

                            </Pressable>
                        )}
                    </View>
                </View>

                {/**Priority */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}> Priority </Text>
                    <View style={styles.pickerContainer}>
                        {/* <Picker
                            selectedValue={selectedPriority}
                            style={styles.picker}
                            // style={{height: 50, width: 150}}
                            onValueChange={(value) => setSelectedPriority(value)}
                        >
                            <Picker.Item label="Low" value="low" />
                            <Picker.Item label="Medium" value="medium" />
                            <Picker.Item label="High" value="high" />
                        </Picker> */}

                        <Picker
                            selectedValue={selectedPriority}
                            style={styles.picker}
                            // style={{height: 50, width: 150}}
                            onValueChange={(value) => setSelectedPriority(value)}
                        >
                            <Picker.Item label="Select a priority" value={null}/>
                            {priority.map((item, index) => (
                                <Picker.Item key={index} label={item.label} value={item.value} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/**Category */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}> Category </Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedCategory}
                            style={styles.picker}
                            onValueChange={(value) => setSelectedCategory(value)}
                        >
                            <Picker.Item label="Select a category" value={null}/>
                            {category.map((item, index) => (
                                <Picker.Item key={index} label={item.label} value={item.value} />
                            ))}
                        </Picker>
                    </View>
                    <TouchableOpacity style={styles.addTagButton} onPress={() => setIsModalVisible(true)}>
                        <Text style={styles.addTagButtonText}> Add New Tag</Text>
                    </TouchableOpacity>
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalHeader}> Add New Tag</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newTag}
                                onChangeText={setNewTag}
                                placeholder="Enter tag name"
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
                                    <Text style={styles.modalButtonText}> Cancel </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalButton} onPress={addNewTag}>
                                    <Text style={styles.modalButtonText}>Add Tag </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>


                {/**Save & Close Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton}>
                        <Button
                            style={styles.buttonText}
                            title="Cancel"
                            onPress={cancelTask}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
                        <Button
                            style={styles.buttonText}
                            title="Save"
                            onPress={saveTask}
                        />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer:{
        flex: 1, 
        backgroundColor: '#040D12'
    },
    container:{
        flexGrow:1,
        padding: 20, 
        backgroundColor: '#040D12'
    },
    header:{
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#93B1A6'
    }, 
    //title, description
    section:{  
       marginBottom: 20, 
    },
    sectionHeader:{
        color: '#93B1A6'
    },
    input:{
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#183D3D',
        color: 'white'
    },

    //subtask
    subtaskContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxIcon:{
        marginRight: 10
    },
    iconButton:{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginTop: 10,
    },

    //deadline
    textInputWithIcon:{
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
    },
    datePicker:{
        height: 120, 
        marginTop: -10
    },
    cancelDatebutton:{
        height: 50, 
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50, 
        marginTop: 10, 
        marginBottom: 15, 
        backgroundColor: '#075985'
    },
    pickerButton:{
        paddingHorizontal: 20
    },
    buttonText:{
        fontSize: 14, 
        fontWeight: 500, 
        color: '#fff'
    },
    calendarIcon:{
        padding: 10
    },

    //priority
    pickerContainer:{
        borderWidth: 1, 
        borderColor: 'gray',
        borderRadius: 4, 
        backgroundColor: 'white'
    },
    picker:{
        height: 50, 
        width: '100%'
    },

    //category
    addTagButton:{
        // color: '#fff',
        // fontWeight: 'bold',

        marginTop: 10,
        padding: 10,
        backgroundColor: '#075985',
        borderRadius: 5,
        alignItems: 'center',
    },
    addTagButtonText:{
        color: '#fff',
        // color: 'black',
        fontWeight: 'bold',
    },
    modalContainer:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent:{
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalHeader:{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalInput:{
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    modalButtons:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton:{
        padding: 10,
        backgroundColor: '#075985',
        borderRadius: 5,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    modalButtonText:{
        color: '#fff',
        fontWeight: 'bold',
    },

    //save & close
    buttonContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    cancelButton:{
        flex: 1,
        marginRight: 8,
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    saveButton:{
        flex: 1,
        marginLeft: 8,
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    buttonText:{
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
        backgroundColor: 'white',
        marginBottom: 16,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 18,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
        backgroundColor: 'white',
        marginBottom: 16,
    },
});