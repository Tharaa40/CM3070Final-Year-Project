import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import Timeline from 'react-native-timeline-flatlist';
import moment from 'moment';
import { Avatar, Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

// const timeToString = (time) => {
//     const date = new Date(time);
//     return date.toISOString().split('T')[0];
// };

// export default function CalendarView2() {
//     const [items, setItems] = useState({});
//     const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
//     const [loading, setLoading] = useState(true);
//     const isFocused = useIsFocused();

//     const loadItems = async() => {
//         setLoading(true);
//         try{
//             const user = FIREBASE_AUTH.currentUser;
//             if(user){
//                 const user_Id = user.uid;
//                 const tasksCollection = collection(FIRESTORE_DB, 'tasks');
//                 const q = query(tasksCollection, where('userId', '==', user_Id));
//                 const querySnapshot = await getDocs(q);
//                 const tasksList = {};

//                 querySnapshot.forEach((doc) => {
//                     const taskData = doc.data();
//                     // const date = new Date (taskData.deadline);
//                     const date = moment(taskData.deadline, 'M/D/YYYY h:mm A').toDate();
//                     if(!isNaN(date)){
//                         const formattedDate = moment(date).format('YYYY-MM-DD');
//                         if(!tasksList[formattedDate]){
//                         tasksList[formattedDate] = [];
//                         }
//                         tasksList[formattedDate].push({
//                         ...taskData, 
//                         id: doc.id,
//                         name: taskData.title, 
//                         height: 100,
//                         });
//                     }
//                 });
//                 console.log('Tasks fetched:', tasksList);
//                 setItems(tasksList);
//             }else{
//                 console.log('User not authenticated');
//                 Alert.alert('Error', 'User not authenticated');
//             }
//         }catch(error){
//             console.error('Error fetching tasks:', error);
//             Alert.alert('Error', 'Error fetching tasks');
//         }
//         setLoading(false);
//     };

//     useEffect(() => {
//         if(isFocused){
//             loadItems();
//         }
//     }, [isFocused]);

//     const renderItem = (item) => {
//         return (
//           <TouchableOpacity key={item.id} style={styles.dates}>
//             <Card>
//               <Card.Content>
//                 <View style={styles.cardView}>
//                   <Text>{item.name}</Text>
//                   <Avatar.Text label={item.name.charAt(0)} />
//                 </View>
//               </Card.Content>
//             </Card>
//           </TouchableOpacity>
//         );
//     };

//     const handleDateSelected = (date) => {
//         setSelectedDate(date.format('YYYY-MM-DD'));
//     };
    
//     const renderTasksForSelectedDate = () => {
//         const tasksForDate = items[selectedDate] || [];
//         return tasksForDate.map((item) => renderItem(item));
//     };

//     return (
//         <View style={styles.container}>
//             <CalendarStrip
//                 style={styles.calendar}
//                 selectedDate={selectedDate}
//                 onDateSelected={handleDateSelected}
//             />
//             {loading ? (
//                 <ActivityIndicator size="large" color="#0000ff" />
//             ) : (
//                 <View style={styles.taskContainer}>
//                     {renderTasksForSelectedDate()}
//                 </View>
//             )}
//         </View>
//     );
// }


// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     calendar: {
//         height: 100,
//         paddingTop: 20,
//         paddingBottom: 10,
//     },
//     taskContainer: {
//         flex: 1,
//         padding: 10,
//     },
//     cardView: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     dates: {
//         marginRight: 10,
//         marginTop: 17,
//     },
//     emptyDate: {
//         height: 15,
//         flex: 1,
//         paddingTop: 30,
//     },
// });








// The below code shows the timeline along with
export default function CalendarView() {
    const [items, setItems] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment().startOf('day'));
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
  
    // Function to load items from Firestore
    const loadItems = async () => {
      setLoading(true);
      try {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          const user_Id = user.uid;
          const tasksCollection = collection(FIRESTORE_DB, 'tasks');
          const q = query(tasksCollection, where('userId', '==', user_Id));
          const querySnapshot = await getDocs(q);
          const tasksList = [];
          querySnapshot.forEach((doc) => {
            const taskData = doc.data();
            const deadline = moment(taskData.deadline, 'M/D/YYYY h:mm A');
            if (deadline.isValid()) {
              tasksList.push({
                time: deadline.format('h:mm A'), // Format time to '9:30 AM'
                title: taskData.title,
                description: taskData.description,
                date: deadline.format('YYYY-MM-DD') // Store the date in 'YYYY-MM-DD' format for filtering
              });
            }
          });
          setItems(tasksList);
          // Filter items based on the initially selected date
          filterItems(selectedDate, tasksList);
        } else {
          console.log('User not authenticated');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
      setLoading(false);
    };
  
    // Function to filter items based on the selected date
    const filterItems = (date, itemsList) => {
      const formattedDate = date.format('YYYY-MM-DD');
      const filtered = itemsList.filter(item => item.date === formattedDate);
      // Sort the filtered items by time
      filtered.sort((a, b) => moment(a.time, 'h:mm A').diff(moment(b.time, 'h:mm A')));
      setFilteredItems(filtered);
    };
  
    // Load items on mount
    useEffect(() => {
      loadItems();
    }, []);
  
    // Filter items whenever the selected date changes
    useEffect(() => {
      if (items.length > 0) {
        filterItems(selectedDate, items);
      }
    }, [selectedDate, items]);
  
    const onDateSelected = (date) => {
      setSelectedDate(date);
    };
  
    return (
      <View style={styles.container}>
        <CalendarStrip
          style={styles.calendar}
          selectedDate={selectedDate}
          onDateSelected={onDateSelected}
          calendarColor={'white'}
          calendarHeaderStyle={{ color: 'black' }}
          dateNumberStyle={{ color: 'black' }}
          dateNameStyle={{ color: 'black' }}
          highlightDateNameStyle={{ color: 'blue' }}
          highlightDateNumberStyle={{ color: 'blue' }}
          // Remove startingDate and endingDate to keep the calendar from resetting
        />
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Timeline
            data={filteredItems}
            circleSize={20}
            circleColor='blue'
            lineColor='blue'
            timeStyle={styles.timeStyle}
            descriptionStyle={styles.descriptionStyle}
            options={{
              style: { paddingTop: 5 }
            }}
          />
        )}
      </View>
    );
}
  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 30,
    },
    calendar: {
      height: 100,
      paddingTop: 20,
      paddingBottom: 10,
    },
    timeStyle: {
      textAlign: 'center',
      backgroundColor: '#ddd',
      padding: 5,
      borderRadius: 13,
      color: 'black',
      fontSize: 16
    },
    descriptionStyle: {
      color: 'gray'
    }
});