import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import { BottomSheetProps } from './type';
import { styles } from './bottomsheet_style';

const { height } = Dimensions.get('window');

const BottomSheet = ({ visible, onClose, children, heightRatio = 0.6 }: BottomSheetProps) => {
  
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: height * (1 - heightRatio),
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.backdrop, { opacity: visible ? 0.5 : 0 }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }], height: height * heightRatio }]}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
};

export default BottomSheet;
