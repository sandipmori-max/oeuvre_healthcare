import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Text,
} from "react-native";
import FastImage from "react-native-fast-image";

const AnimatedLoader = ({
  isVisible = false,
  text = "Loading...",
  imageUrl = "https://kcsanand.deverp.net/fileupload/1/InvoiceByConfig/1/logo.jpg",
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  // 🔥 Animations
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  // 🔄 Fade In / Out Control
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [isVisible]);

  // 🔄 Continuous Animations
  useEffect(() => {
    if (!shouldRender) return;

    // Rotate
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shouldRender]);

  if (!shouldRender) return null;

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View
        style={[
          styles.loaderContainer,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.View style={{ 
            height:100,
            width:100,
            backgroundColor:'gray',
            // transform: [{ rotate: rotateInterpolate }] 
        }}
            
            >
          <FastImage
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.contain}
          />
        </Animated.View>

        <Text style={styles.text}>{text}</Text>
      </Animated.View>
    </Animated.View>
  );
};

export default AnimatedLoader;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)", // 🔥 blur effect
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loaderContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 5,
  },
  image: {
    width: 180,
    height: 180,
    backgroundColor:'green'
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
  },
});