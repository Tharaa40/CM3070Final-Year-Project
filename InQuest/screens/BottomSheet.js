//this is responsible for the task creation USE THIS  
//

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Pressable, Platform } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Text, Menu, Button as ButtonA, PaperProvider, } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker'; //Calendar and time selection


import { FIRESTORE_DB, FIREBASE_AUTH } from "../firebaseConfig";
import { collection, addDoc, updateDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";



export default function TaskBottomSheet({ navigation, route, props}) {
    const [taskId, setTaskId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [deadline, setDeadline] = useState('');
    const [date, setDate] = useState(new Date()); //monitoring the current date of the picker 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [visiblePriority, setVisiblePriority] = useState(false);
    const priority = [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' }
    ];
    const [selectedPriority, setSelectedPriority] = useState(null);


    //CATEGORY - NEW 
    const [inputCat, setInputCat] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        if(userId){
            fetchTags(userId, setTags);
        }
    }, [userId]);



    useEffect(() => { //the form is populated when there is no existing task being edited 
        if (route.params?.task) {
            const { task } = route.params;
            setTitle(task.title);
            setDescription(task.description);
            setSubtasks(task.subtasks);
            setDeadline(task.deadline);
            setSelectedPriority(task.selectedPriority);
            setTaskId(task.id);
        }
    }, [route.params?.task]);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            if(user){
                setUserId(user.uid);
            }else{
                navigation.navigate('Login');
            }
        });
        return unsubscribe;
    }, []);
    
    const fetchTags = async (userId, setTags) => {
        try {
          const userDocRef = doc(FIRESTORE_DB, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setTags(userData.tags || []);
          }
        } catch (error) {
          console.error('Error fetching tags: ', error);
        }
    };

    const handleAddTag = () => {
        if (inputCat.trim() !== '' && !tags.find(tag => tag.text === inputCat.trim())) {
          const newTag = { text: inputCat.trim(), color: getRandomColor() };
          const updatedTags = [...tags, newTag];
          setTags(updatedTags);
          setInputCat('');
          saveCatTags([...tags, newTag]);
        }
    };
    const handleRemoveTag = (tag) => {
        const updatedTags = tags.filter((t) => t.text !== tag.text);
        setTags(updatedTags);
        saveCatTags(updatedTags);
    };
    const handleTagClick = (tag) => {
        setSelectedCategory(tag.text);
        setInputCat(tag.text);
    };

    const getRandomColor = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`;
    };
    const saveCatTags = async(tags) => {
        try{
            const userDocRef = doc(FIRESTORE_DB, 'users', userId);
            await setDoc(userDocRef, {tags}, {merge: true});
        }catch(error){
            console.error('Error saving tags: ', error);
        }
    }
    
 

    //Subtask
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


    const handlePriorityPress = (value) => { //This is for priority using Menu from 'react native paper' library
        setSelectedPriority(value);
        setVisiblePriority(false);
    }

    const saveTask = async() => { //this is working
        //added this for user 
        if(!userId){
            console.error('User not authenticated');
            return;
        }
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
                    userId //added this for user
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
                    userId //added this for user
                });
                console.log('Task saved');
            }
            navigation.navigate('Details');
        }catch(error){
            console.error('Error saving task: ', error);
        }
    };

    const cancelTask = async() => {
        // navigation.navigate('HomePage');

        navigation.navigate('HomeTab');
    }








    // ref
    const bottomSheetRef = useRef();


    // // callbacks
    // const handleSheetChanges = useCallback((index) => {
    //     console.log('handleSheetChanges', index);
    // }, []);

    const snapPoints = useMemo(() => ['85%', '100%'], []);

    // renders
    return (
        <PaperProvider>
            <View style={styles.container}>
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    style={{borderTopLeftRadius: 10}}
                    // onChange={handleSheetChanges}
                    backgroundStyle={{backgroundColor: '#040D12'}}
                    handleIndicatorStyle = {{backgroundColor: 'white', width: '50%', height: 3}}
                >
                    <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
                        <View>
                            <Text variant="headlineLarge" style={styles.header}> Add Task </Text>
                            {/**Title */}
                            <View style={styles.section}>
                                <Text variant="headlineSmall" style={styles.sectionHeader}> Title </Text>
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
                                <Text variant="headlineSmall" style={styles.sectionHeader}> Description </Text>
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
                                <Text variant="headlineSmall" style={styles.sectionHeader}> Subtasks </Text>
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
                                <Text variant="headlineSmall" style={styles.sectionHeader}> Deadline </Text>
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
                                            <Icon name='calendar' size={30} color='gray' />
                                        </Pressable>
                                    )}
                                    {!showDatePicker && !showTimePicker && (
                                        <Pressable
                                            style={styles.clockIcon}
                                            onPress={toggleTimepicker}
                                        >
                                            <Icon name='clock-o' size={35} color='gray' />

                                        </Pressable>
                                    )}
                                </View>
                            </View>

                            {/**Priority */}
                            <View style={styles.section}>
                                <Text variant="headlineSmall" style={styles.sectionHeader}> Priority </Text>
                                <View style={styles.pickerContainer}>
                                <Menu
                                    visible={visiblePriority}
                                    onDismiss={() => setVisiblePriority(false)}
                                    anchor={
                                        <ButtonA mode="outlined" onPress={() => setVisiblePriority(true)} style={styles.priorityButton} labelStyle={{color: 'white'}}>
                                            {selectedPriority ? priority.find(p => p.value === selectedPriority)?.label : "Select a priority"}
                                        </ButtonA>
                                    }
                                >
                                    {priority.map((item, index) => (
                                        <Menu.Item
                                            key={index}
                                            title={item.label}
                                            onPress={() => handlePriorityPress(item.value)}
                                        />
                                    ))}
                                </Menu>
                                    {/* <Picker
                                        selectedValue={selectedPriority}
                                        style={styles.picker}
                                        // style={{height: 50, width: 150}}
                                        onValueChange={(value) => setSelectedPriority(value)}
                                    >
                                        <Picker.Item label="Select a priority" value={null}/>
                                        {priority.map((item, index) => (
                                            <Picker.Item key={index} label={item.label} value={item.value} />
                                        ))}
                                    </Picker> */}
                                </View>
                            </View>

                            {/**Category */}
                            <View style={styles.section}>
                                <Text variant="headlineSmall" style={styles.sectionHeader}> Category </Text>
                                <View style={styles.pickerContainer}>
                                    <TextInput      
                                        style = {styles.input}
                                        value={inputCat}
                                        onChangeText={setInputCat}
                                        onSubmitEditing={handleAddTag}
                                        placeholder="Enter a tag and press enter 2"
                                        placeholderTextColor= '#93B1A6'
                                    />
                                    <View style={styles.tagsContainer}>
                                        {tags.map((tag, index) => (
                                            <TouchableOpacity key={index} onPress={() => handleTagClick(tag)} style={[styles.tag, { backgroundColor: tag.color }]}>
                                                <Text style={styles.tagText}>{tag.text}</Text>
                                                <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                                                    <Text style={styles.removeTag}>x</Text>
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            {/**Save & Close Buttons */}
                            <View style={styles.buttonContainer}>
                                <ButtonA 
                                    mode="contained"
                                    style={styles.cancelButton}
                                    onPress={cancelTask}
                                >  
                                    Cancel
                                </ButtonA>
                                <ButtonA
                                    mode="contained"
                                    style={styles.saveButton}
                                    onPress={saveTask}
                                >  
                                    Save
                                </ButtonA>
                            </View>


                        </View>
                    </BottomSheetScrollView>
                </BottomSheet>
            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'grey',
        // borderTopLeftRadius: 15, 
        // borderTopRightRadius: 15,
        overflow: 'hidden'
    },
    contentContainer: {
        paddingHorizontal: 16,
        backgroundColor: 'black'
    }, 
    bottomSheet:{
        backgroundColor: 'yellow',
        // borderTopLeftRadius: 150
    },
    header: {
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#93B1A6'
    },

    //title, description
    section:{       
        marginBottom: 20, 
    },
    sectionHeader:{
        color: '#93B1A6',
        fontWeight: '500',
        marginBottom: 3
    },
    input:{
        borderWidth: 1,
        borderColor: '#ccc',
        marginVertical: '1%',
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
    deadlinePickerCont:{
        borderRadius: 10, // Adjust radius as needed
        borderWidth: 1,
        borderColor: '#ccc', // Adjust color as needed
        overflow: 'hidden',
        padding: 8, // Optional: Add padding to ensure content doesn't touch edges
        backgroundColor: 'yellow'
    },  
    datePicker:{
        width: '100%'
        // height: 120, 
        // marginTop: -10,
        // borderRadius: 35,
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
        paddingHorizontal: 20,
        // paddingRight: 20
    },

    //priority
    priorityButton: {
        backgroundColor: '#183D3D', 
        borderWidth: 1, 
        rippleColor: 'rgba(50, 92, 62, 0.8)',
    },
    picker:{
        height: 50, 
        width: '100%'
    },

    //category
    tagsContainer:{
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    tag: {
        borderRadius: 15, 
        padding: 5, 
        paddingHorizontal: 10, 
        margin: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagText: {
        marginRight: 5,
    },
    removeTag: {
        color: '#ff0000',
        fontWeight: 'bold',
    },

    //save & close
    buttonContainer:{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        // alignItems: 'center'
    },
    cancelButton:{
        // flex: 1,
        marginRight: '34%',
        marginBottom: '50%',
        // padding: 16,
        // borderRadius: 8,
        backgroundColor: '#183D3D',
        // alignItems: 'center',
    },
    saveButton:{
        // flex: 1,
        // marginLeft: 8,
        // marginRight: '34%',
        marginBottom: '50%',
        // padding: 16,
        // borderRadius: 8,
        backgroundColor: '#5C8374',
        // alignItems: 'center',
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












