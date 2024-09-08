import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useTheme } from "react-native-paper";


export default function Chart({ taskCompletionData, timeSpentData, labels }){
    const theme = useTheme();

    const screenWidth = Dimensions.get('window').width;
    // const chartConfig = {
    //     backgroundColor: "#2c3e50",
    //     backgroundGradientFrom: "#2980b9",
    //     backgroundGradientTo: "#2c3e50",
    //     color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    //     labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    //     style:{ borderRadius: 16 },
    //     propsForDots: {
    //         r: "5",
    //         strokeWidth: "2",
    //         stroke: "#3498db"
    //     },
    //     propsForBackgroundLines:{
    //         strokeDasharray: ""
    //     }
    // }

    // const chartConfig = {
    //     backgroundColor: theme.colors.surface,
    //     backgroundGradientFrom: theme.colors.primary,
    //     backgroundGradientTo: theme.colors.primaryAlt,
    //     color: (opacity = 1) => theme.colors.textAlt.replace('1)', `${opacity})`),
    //     labelColor: (opacity = 1) => theme.colors.text.replace('1)', `${opacity})`),
    //     style: { borderRadius: 10 },
    //     propsForDots: {
    //         r: "5",
    //         strokeWidth: "2",
    //         stroke: theme.colors.accent,
    //     },
    //     propsForBackgroundLines: {
    //         strokeDasharray: "",  // Adds dashed lines for better visibility
    //     },
    // };

    const chartConfig = {
        backgroundColor: theme.colors.surface,
        backgroundGradientFrom: theme.colors.primary,
        backgroundGradientTo: theme.colors.primaryAlt,
        color: (opacity = 1) => {
          const textAltColor = theme.colors.textAlt || 'rgba(0, 0, 0, 1)'; // Default fallback
          return textAltColor.replace('1)', `${opacity})`);
        },
        labelColor: (opacity = 1) => {
          const textColor = theme.colors.text || 'rgba(0, 0, 0, 1)'; // Default fallback
          return textColor.replace('1)', `${opacity})`);
        },
        style: { borderRadius: 10 },
        propsForDots: {
          r: "5",
          strokeWidth: "2",
          stroke: theme.colors.accent,
        },
        propsForBackgroundLines: {
          strokeDasharray: "",  // Adds dashed lines for better visibility
        },
    };

    return(
        <View style={styles.chartContainer}>
            <LineChart
                data={{
                    labels: labels,
                    datasets: [{ data: taskCompletionData }],
                }}
                width={screenWidth - 40}
                height={240}
                yAxisLabel=""
                yAxisSuffix=" tasks"
                yLabelsOffset={5}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
            />
            <BarChart
                data={{
                    labels: labels,
                    datasets: [{ data: timeSpentData  }],
                }}
                width={screenWidth-40}
                height={240}
                yAxisLabel=""
                yAxisSuffix=" mins"
                yLabelsOffset={5}
                chartConfig={chartConfig}
                style={styles.chartStyle}
            />
        </View>
    );
}





const styles = StyleSheet.create({
    chartContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    chartStyle: {
        marginVertical: 8,
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});