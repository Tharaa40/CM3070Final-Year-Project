import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Agenda } from 'react-native-calendars';
import moment, { months } from 'moment';
import { Avatar, Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

//2nd code - somewhat works
const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

export default function CalendarView() {
  const [items, setItems] = useState({});
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [currentMonthYear, setCurrentMonthYear] = useState(moment().format('YYYY-MM'));
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const isFocused = useIsFocused();

  const loadItems = async (day) => {
    setLoading(true);
    try{
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        // console.log('User is authenticated', user);
        const user_Id = user.uid;
        const tasksCollection = collection(FIRESTORE_DB, 'tasks');
        const q = query(tasksCollection, where('userId', '==', user_Id));
        const querySnapshot = await getDocs(q);
        const tasksList = {};
        querySnapshot.forEach((doc) => {
          const taskData = doc.data();
          // const date = new Date (taskData.deadline);
          const date = moment(taskData.deadline, 'M/D/YYYY h:mm A').toDate();
          if(!isNaN(date)){
            const formattedDate = moment(date).format('YYYY-MM-DD');
            if(!tasksList[formattedDate]){
              tasksList[formattedDate] = [];
            }
            tasksList[formattedDate].push({
              ...taskData, 
              id: doc.id,
              name: taskData.title, 
              height: 100,
            });
          }
        });

        const start = moment(day.dateString).startOf('month');
        const end = moment(day.dateString).endOf('month');
        for(let m = moment(start); m.isBefore(end); m.add(1, 'days')){
          const dateString = m.format('YYYY-MM-DD');
          if(!tasksList[dateString]){
            tasksList[dateString] = [];
          }
        }

        console.log("Tasks fetched:", tasksList); // Debug log
        setItems(tasksList);
      }else{
        console.log('User not authenticated');
        Alert.alert('Error', 'User not authenticated');
      }
    }catch(error){
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Error fetching tasks');
    }
    setLoading(false);
    setLoaded(true);
  };

  useEffect(() => {
    if (isFocused) {
      loadItems({dateString: currentMonthYear + '-01'});
    }
  }, [isFocused, currentMonthYear]);

  const renderItem = (item) => {
    return (
      <TouchableOpacity style={styles.dates}>
        <Card>
          <Card.Content>
            <View style={styles.cardView}>
              <Text>{item.name}</Text>
              <Avatar.Text label={item.name.charAt(0)} />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const handleMonthYearChange = (itemValue) => {
    const [year, month] = itemValue.split('-');
    const newDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
    setCurrentMonthYear(itemValue);
    setSelectedDate(newDate);
  };

  const generateMonthYearOptions = () => {
    const options = [];
    for (let year = 1900; year <= 2100; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthYear = moment(`${year}-${month}-01`).format('YYYY-MM');
        options.push(monthYear);
      }
    }
    return options;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Picker
          selectedValue={currentMonthYear}
          style={styles.picker}
          onValueChange={handleMonthYearChange}
          mode='dropdown'
        >
          {generateMonthYearOptions().map((option) => (
            <Picker.Item label={option} value={option} key={option} />
          ))}
        </Picker>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Agenda
          items={items}
          loadItemsForMonth={loaded ? undefined : loadItems}
          // loadItemsForMonth={loadItems}
          selected={selectedDate}
          renderItem={renderItem}
          renderEmptyDate={() => <View style={styles.emptyDate}></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: 150,
    color: 'blue',
  },
  cardView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dates: {
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});







