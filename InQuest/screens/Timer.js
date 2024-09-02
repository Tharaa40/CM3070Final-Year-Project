import React, {useState, useRef} from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome';


export default function Timer() {
   
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);
    const theme = useTheme();
  
    const startTimer = (duration) => {
      setTimeRemaining(duration);
      setIsActive(true);
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    };
  
    const pauseTimer = () => {
      clearInterval(intervalRef.current);
      setIsActive(false);
    };
  
    const resetTimer = () => {
      clearInterval(intervalRef.current);
      setTimeRemaining(0);
      setIsActive(false);
    };
  
    const handleMinutePress = (minutes) => {
      if (!isActive) {
        startTimer(minutes * 60);
      }
    };

    return(
        <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <Text style={[styles.title, {color: theme.colors.text}]}>Timer</Text>
            <View style={styles.minuteContainer}>
                {['15', '30', '45', '60'].map((minute) => (
                    <TouchableOpacity 
                        key={minute} 
                        style={[styles.minuteBox, {backgroundColor: theme.colors.primary}]} 
                        onPress={() => handleMinutePress(parseInt(minute, 10))}
                    >
                        <Text style={[styles.minuteText, {color: theme.colors.textAlt}]}>{minute}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.timerContainer}>
                <View style={[styles.circle, {borderColor: theme.colors.primary}]}>
                    <Text style={[styles.timerText, {color: theme.colors.primary}]}>
                        {`${Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:${(timeRemaining % 60).toString().padStart(2, '0')}`}
                    </Text>
                </View>
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style = {[styles.button, isActive ? styles.buttonDisabled: {}]}
                    onPress = {pauseTimer}
                    disabled = {!isActive}
                >
                    <Icon name="pause" size={30} color={isActive ? theme.colors.accent : '#CCC'} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={resetTimer}
                >
                    <Icon name="repeat" size={30} color={theme.colors.accent} />
                </TouchableOpacity>

                <TouchableOpacity
                    style = {[styles.button, isActive ? styles.buttonDisabled : {}]}
                    onPress = {() => startTimer(timeRemaining)}
                    disabled = {isActive}
                >
                    <Icon name="play" size={30} color={isActive ? '#CCC' : theme.colors.accent } />
                </TouchableOpacity>
                {/* <TouchableOpacity style= {styles.button}  onPress={pauseTimer} disabled={!isActive}>
                    <Icon name="pause" size={30} color='#93B1A6' />
                </TouchableOpacity>

                <TouchableOpacity style= {styles.button} onPress={resetTimer}>
                    <Icon name="repeat" size={30} color='#93B1A6'/>
                </TouchableOpacity>

                <TouchableOpacity style= {styles.button} onPress={() => startTimer(timeRemaining)} disabled={isActive}>
                    <Icon name="play" size={30} color='#93B1A6' />
                </TouchableOpacity> */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title:{
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    minuteContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginVertical: 10
    },
    minuteBox:{
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    minuteText:{
        fontSize: 18,
        fontWeight: '600'
    },
    timerContainer:{
        alignItems: 'center'
    },
    circle:{
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 5,
        // borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 50
    },
    timerText:{
        fontSize: 40,
        fontWeight: 'bold',
    },
    buttonsContainer:{
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '60%',
    },
    button:{
        padding: 20,
        borderRadius: 10,
        // backgroundColor: '#FFF',
        // borderRadius: 50, 
        // padding: 10, 
        // elevation: 3,
    },
    buttonDisabled:{
        opacity: 0.5
    }


    

});