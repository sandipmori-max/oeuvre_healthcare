import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Text, Image } from 'react-native';
import { ERP_ICON } from '../../assets';

interface ShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

const Shimmer: React.FC<ShimmerProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 150],
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }]}>
      <Image source={ERP_ICON.NO_IMG} style={{
        height: height,
        width: width,

      }} resizeMode="contain" />

    </View>
  );
};

export default Shimmer;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  shimmer: {
    width: '40%',
    height: '100%',
    backgroundColor: '#fffefeff',
    opacity: 0.7,
    alignContent: 'center',
    alignItems: 'center',
  },
});
