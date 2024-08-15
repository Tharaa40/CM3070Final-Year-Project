import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";


export default function Chart({ taskCompletionData, timeSpentData, labels }){

    const screenWidth = Dimensions.get('window').width;
    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    }

    return(
        <View style={styles.chartContainer}>
            <LineChart
                data={{
                    labels: labels,
                    datasets: [{ data: taskCompletionData }],
                }}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
            />
            <BarChart
                data={{
                    labels: labels,
                    datasets: [{ data: timeSpentData  }],
                }}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
            />
        </View>
    );
}




// export default function Chart({ data, labels }){

//     const screenWidth = Dimensions.get('window').width;
//     const chartConfig = {
//         backgroundGradientFrom: '#ffffff',
//         backgroundGradientTo: '#ffffff',
//         color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//     }

//     return(
//         <View style={styles.chartContainer}>
//             <LineChart
//                 data={{
//                     labels: labels,
//                     datasets: [{ data: data }],
//                 }}
//                 width={screenWidth}
//                 height={220}
//                 chartConfig={chartConfig}
//             />
//             <BarChart
//                 data={{
//                     labels: labels,
//                     datasets: [{ data: data }],
//                 }}
//                 width={screenWidth}
//                 height={220}
//                 chartConfig={chartConfig}
//             />
//         </View>
//     );
// }

const styles = StyleSheet.create({
    chartContainer: {
        marginVertical: 8,
        borderRadius: 16,
    },
});