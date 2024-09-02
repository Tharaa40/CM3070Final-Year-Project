import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const DynamicAnimation = ({ animations }) => {
    return (
        <View style={styles.container}>
            {animations.map((animation, index) => (
                <LottieView
                    key={index}
                    source={animation.source}
                    autoPlay
                    loop
                    style={[
                        styles.animation,
                        animation.style,
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject, // Ensures it covers the entire parent
    },
    animation: {
        position: 'absolute',
    },
});

export default DynamicAnimation;