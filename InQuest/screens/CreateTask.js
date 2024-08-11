//THIS FILE IS NO LONGER IN USE 

import React, {useState, useRef, useEffect, useMemo, useCallback} from "react";
import { SafeAreaView ,KeyboardAvoidingView, View, TextInput, TouchableOpacity, StyleSheet, Pressable, Platform, Button } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker'; //Calendar and time selection
// import RNPickerSelect from 'react-native-picker-select'; //for both category and priority
import { Picker } from "@react-native-picker/picker";
import moment from "moment";

import { FIRESTORE_DB, FIREBASE_AUTH } from "../firebaseConfig";
import { collection, addDoc, updateDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { PaperProvider, Text, Menu, Button as ButtonA, Modal, Portal, Provider } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import BottomSheet, { BottomSheetModal, BottomSheetView, BottomSheetScrollView, BottomSheetModalProvider, BottomSheetBackdrop, BottomSheetTextInput} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function CreateTask({ navigation, route }){ 

    const [taskId, setTaskId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [deadline, setDeadline] = useState('');
    const [date, setDate] = useState(new Date()); //monitoring the current date of the picker 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    // const [priority, setPriority] = useState([
    //     {label: 'Low', value: 'Low'},
    //     {label: 'Medium', value: 'Medium'},
    //     {label: 'High', value: 'High'}
    // ]);

    const [visiblePriority, setVisiblePriority] = useState(false);
    const priority = [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' }
    ];
    const [selectedPriority, setSelectedPriority] = useState(null);
    // const priorities = ['Low', 'Medium', 'High'];

    //Category -OLD
    // const [category, setCategory] = useState([
    //     { label: 'Work', value: 'work' },
    //     { label: 'Personal', value: 'personal' },
    //     { label: 'Other', value: 'other' }
    // ]);
    // const [selectedCategory, setSelectedCategory] = useState(null);
    // const [isModalVisible, setIsModalVisible] = useState(false);
    // const [newTag, setNewTag] = useState('');



    //CATEGORY - NEW 
    const [inputCat, setInputCat] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    // useFocusEffect(
    //     React.useCallback(() => {
    //       // Reset form fields when screen is focused
    //       setTitle('');
    //       setDescription('');
    //       setSubtasks([]);
    //       setDeadline('');
    //       setSelectedPriority('');
    //       setSelectedCategory('');
    //     //   setDescription('');
    //       // Reset other task states...
    //     }, [])
    // );


    useEffect(() => {
        if(userId){
            fetchTags(userId, setTags);
        }
    }, [userId]);

    // useEffect(() => {
    //     if (route.params?.task) {
    //         const task = route.params.task;
    //         setTitle(task.title);
    //         setDescription(task.description);
    //         setDeadline(task.deadline);
    //         setSelectedPriority(task.selectedPriority);
    //         setSelectedCategory(task.category);
    //         setTaskId(task.id);
    //     } else {
    //         // Reset state if creating a new task
    //         setTitle('');
    //         setDescription('');
    //         setDeadline('');
    //         setSelectedPriority(null);
    //         setSelectedCategory('');
    //         setTaskId(null);
    //     }
    // }, [route.params?.task]);

    useEffect(() => { //the form is populated when there is no existing task being edited 
        if (route.params?.task) {
        // if (route.params?.task && !taskId) {
            const { task } = route.params;
            setTitle(task.title);
            setDescription(task.description);
            setSubtasks(task.subtasks);
            setDeadline(task.deadline);
            setSelectedPriority(task.selectedPriority);
            // setSelectedCategory(task.category);
            setTaskId(task.id);
        }
    // }, [route.params?.task, taskId]);
    }, [route.params?.task]);

    // useFocusEffect( //this is to reset 
    //     React.useCallback(() => {
    //         setTitle('');
    //         setDescription('');
    //         setSubtasks([]);
    //         setDeadline('');
    //         setSelectedPriority(null);
    //         setSelectedCategory('');
    //         setTaskId(null);
    //     }, [])
    // );

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

    //Category   
    // const addNewTag = () => {
    //     if(newTag){
    //         setCategory([...category, { label: newTag, value: newTag.toLowerCase()}])
    //         setSelectedCategory(newTag.toLowerCase());
    //         setNewTag('');
    //         setIsModalVisible(false);
    //     }
    // };

    //Save and close 
    // const saveTask = async() => {
    //     //added this for user 
    //     if(!userId){
    //         console.error('User not authenticated');
    //         return;
    //     }
    //     try{
    //         if(taskId){
    //             const taskRef = doc(FIRESTORE_DB, 'tasks', taskId);
    //             await updateDoc(taskRef,{
    //                 title, 
    //                 description, 
    //                 subtasks, 
    //                 deadline, 
    //                 selectedPriority,
    //                 // category: selectedCategory,
    //                 updatedAt: new Date().toISOString(),
    //                 userId //added this for user
    //             });
    //             console.log('Task updated');
    //         }else{
    //             await addDoc(collection(FIRESTORE_DB, 'tasks'), {
    //                 title, 
    //                 description, 
    //                 subtasks, 
    //                 deadline, 
    //                 selectedPriority,
    //                 // category: selectedCategory, 
    //                 createdAt: new Date().toISOString(),
    //                 userId //added this for user
    //             });
    //             console.log('Task saved');
    //         }
    //         navigation.navigate('Details');
    //     }catch(error){
    //         console.error('Error saving task: ', error);
    //     }
    // };




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

            //Save the tags
            // const userDocRef = doc(FIRESTORE_DB, 'users', userId);
            // const userDoc = await getDoc(userDocRef);
            // if(userDoc.exists()){
            //     const existingTags = userDoc.data().tags || [];
            //     const newTags = tags.filter(tag => !existingTags.find(t => t.text === tag.text));
            //     const updatedTags = [...existingTags, ...newTags];
            //     await setDoc(userDocRef, {tags:updatedTags}, {merge: true});
            // }else{
            //     await setDoc(userDocRef, {tags}, {merge: true});
            // }

            navigation.navigate('Details');
        }catch(error){
            console.error('Error saving task: ', error);
        }
    };

    const cancelTask = async() => {
        // navigation.navigate('HomePage');

        navigation.navigate('HomeTab');
    }


    {/**this is for bottom sheet */}
    // const sheetRef = useRef<BottomSheet>(null);
    const [isOpen, setIsOpen] = useState(false);
    const sheetRef = useRef();
    
    const handleClosePress = () => sheetRef.current?.close();
    const snapPoints = useMemo(() => ['50%', '100%'], []);

    const showSheet = () => {
        setIsVisible(true);
        sheetRef.current?.present();
    };

    const hideSheet = () => {
        setIsVisible(false);
        sheetRef.current?.dismiss();
    };

      // callbacks
    const handleSheetChanges = useCallback((index) => {
        console.log('handleSheetChanges', index);
    }, []);
    const renderBackdrop = useCallback(
		(props) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={1}
				appearsOnIndex={2}
			/>
		),
		[]
	);


    return(
        // <View>
        //     <BottomSheet
        //         ref={sheetRef}
        //         snapPoints={snapPoints}
        //         backgroundStyle={{backgroundColor: 'beige'}}
        //     >
                <PaperProvider>
                    <ScrollView contentContainerStyle={styles.scrollViewContainer}>                 
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
                                    <ButtonA mode="outlined" onPress={() => setVisiblePriority(true)} style={styles.priorityButton}>
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
                                {/* <Menu
                                    visible={menuVisible}
                                    onDismiss={() => setMenuVisible(false)}
                                    anchor={
                                        <BottomSheetTextInput
                                            style={styles.input}
                                            value={inputCat}
                                            onChangeText={setInputCat}
                                            onFocus={() => setMenuVisible(true)}
                                            placeholder="Enter a tag and press enter"
                                            onSubmitEditing={handleAddTag}
                                        />
                                    }
                                >
                                    {tags.map((tag, index) => ( 
                                        <Menu.Item
                                            key={index}
                                            onPress={() => handleTagClick(tag)}
                                            title={tag.text}
                                        />
                                    ))}
                                </Menu>  */}
                                {/*The above commented portion works */}
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
                                {/* <View style={styles.tagsContainer}>
                                    {tags.map((tag, index) => (
                                        <View key={index} style={[styles.text, {backgroundColor: tag.color}]}>
                                            <Text style={styles.tagText}>{tag.text}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                                                <Text style={styles.removeTag}> x </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View> */}
                                {/* <Picker
                                    selectedValue={selectedCategory}
                                    style={styles.picker}
                                    onValueChange={(value) => setSelectedCategory(value)}
                                >
                                    <Picker.Item label="Select a category" value={null}/>
                                    {category.map((item, index) => (
                                        <Picker.Item key={index} label={item.label} value={item.value} />
                                    ))}
                                </Picker> */}
                            </View>
                            {/* <TouchableOpacity style={styles.addTagButton} onPress={() => setIsModalVisible(true)}>
                                <Text style={styles.addTagButtonText}> Add New Tag</Text>
                            </TouchableOpacity> */}
                        </View>
                        {/* <Modal
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
                        </Modal> */}


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

                            {/* <TouchableOpacity style={styles.cancelButton}>
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
                            </TouchableOpacity> */}
                        </View>

                    </ScrollView>
                </PaperProvider>
            // </BottomSheet>
        // </View>
                          
    );
}

const styles = StyleSheet.create({
    screenContainer:{
        flex: 1, 
        backgroundColor: 'gray'
    },
    bottomSheet:{
        flexGrow:1,
        // // flex: 1,
        // backgroundColor: '#040D12'

        // flex: 1,
        backgroundColor: '#040D12', // Background color of the bottom sheet
        paddingHorizontal: 16,
        paddingVertical: 24,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,


    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        // paddingHorizontal: 16,
    },
    scrollViewContainer:{
        flex: 1,
        marginHorizontal: '2%',
        paddingBottom: 50
    },
    header:{
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
        // marginHorizontal: '5%',
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
        backgroundColor: 'white', 
        borderWidth: 1, 
        rippleColor: 'rgba(50, 92, 62, 0.8)'
    },
    // pickerContainer:{
    //     borderWidth: 1, 
    //     borderColor: 'gray',
    //     borderRadius: 20, 
    //     backgroundColor: 'white'
    // },
    picker:{
        height: 50, 
        width: '100%'
    },

    //category
    // addTagButton:{
    //     marginTop: 10,
    //     padding: 10,
    //     backgroundColor: '#075985',
    //     borderRadius: 5,
    //     alignItems: 'center',
    // },
    // addTagButtonText:{
    //     color: '#fff',
    //     // color: 'black',
    //     fontWeight: 'bold',
    // },
    // modalContainer:{
    //     flex: 1,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // },
    // modalContent:{
    //     width: '80%',
    //     backgroundColor: 'white',
    //     borderRadius: 10,
    //     padding: 20,
    //     alignItems: 'center',
    // },
    // modalHeader:{
    //     fontSize: 18,
    //     fontWeight: 'bold',
    //     marginBottom: 20,
    // },
    // modalInput:{
    //     width: '100%',
    //     borderWidth: 1,
    //     borderColor: '#ccc',
    //     padding: 10,
    //     borderRadius: 5,
    //     marginBottom: 20,
    // },
    // modalButtons:{
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     width: '100%',
    // },
    // modalButton:{
    //     padding: 10,
    //     backgroundColor: '#075985',
    //     borderRadius: 5,
    //     alignItems: 'center',
    //     flex: 1,
    //     marginHorizontal: 5,
    // },
    // modalButtonText:{
    //     color: '#fff',
    //     fontWeight: 'bold',
    // },

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
        marginBottom: '50%'
        // padding: 16,
        // borderRadius: 8,
        // backgroundColor: 'white',
        // alignItems: 'center',
    },
    saveButton:{
        // flex: 1,
        // marginLeft: 8,
        // marginRight: '34%',
        marginBottom: '50%'
        // padding: 16,
        // borderRadius: 8,
        // backgroundColor: 'white',
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