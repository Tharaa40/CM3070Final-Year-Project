import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import Timeline from 'react-native-timeline-flatlist';
import moment from 'moment';
import { useTheme } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';


export default function CalendarView2() {
    const [items, setItems] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment().startOf('day'));
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isFocused = useIsFocused();
  
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
                time: deadline.format('h:mm A'), // Format time to '00:00 AM'
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
      if(isFocused){
        loadItems();
      }
    }, [isFocused]);
  
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
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <CalendarStrip
        style={styles.calendar}
        selectedDate={selectedDate}
        onDateSelected={onDateSelected}
        calendarColor={theme.colors.surface}
        calendarHeaderStyle={{ color: theme.colors.textAlt, fontFamily: 'PlayfairDisplay-Bold', fontWeight: '500' }}
        dateNumberStyle={{ color: theme.colors.text, fontFamily: 'Roboto-Regular', fontWeight: '500' }}
        dateNameStyle={{ color: theme.colors.text, fontFamily: 'Roboto-Regular', fontWeight: '500' }}
        highlightDateNameStyle={{ color: theme.colors.accent,  fontFamily: 'Roboto-Regular', fontWeight: '500' }}
        highlightDateNumberStyle={{ color: theme.colors.accent, fontFamily: 'Roboto-Regular', fontWeight: '500' }}
      />
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.accent} />
      ) : (
        <Timeline
          data={filteredItems}
          circleSize={20}
          circleColor={theme.colors.accent}
          lineColor={theme.colors.accent}
          innerCircle={'dot'}
          timeContainerStyle={{ minWidth: 72 }}
          timeStyle={
            [styles.timeStyle, 
            {
              backgroundColor: theme.colors.surfaceAlt,
              color: theme.colors.textAlt,
              fontFamily: 'Roboto-Regular'
            }
          ]}
          descriptionStyle={
            [styles.descriptionStyle, 
              {
                color: theme.colors.textAlt,
                backgroundColor: theme.colors.surfaceAlt
              }
          ]}
          options={{
            style: { paddingTop: 5, marginHorizontal: 10, position: 'relative', top: 5 },
          }}
          titleStyle={{marginTop: -15, fontFamily: 'Montserrat-SemiBold', color: theme.colors.text}}
        />
      )}
    </View>
  );
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: '20%',
  },
  calendar: {
    height: 100,
    paddingVertical: 10
    // paddingBottom: 10,
  },
  timeStyle: {
    textAlign: 'center',
    padding: 5,
    borderRadius: 5,
    overflow: 'hidden',
    // marginBottom: '20%'
  },
  descriptionStyle: {
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});