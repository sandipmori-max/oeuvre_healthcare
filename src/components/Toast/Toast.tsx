import React, { useRef, useEffect, } from 'react';
import {
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { ERP_COLOR_CODE } from '../../utils/constants';
import { useAppSelector } from '../../store/hooks';

const { width } = Dimensions.get('window');
const Toast = ({ visible, message, onHide }: { visible: boolean; message: string; onHide: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const theme = useAppSelector(state => state.theme.mode);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(onHide);
        }, 2500);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        theme === 'dark' && {
        backgroundColor: "white",
      },
        { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] },
      ]}
    >
      <Text style={[styles.toastText,
      theme === 'dark' && {
         color: 'black'
      }

      ]}>{message}</Text>
    </Animated.View>
  );
};


export default Toast


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6fa',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: width * 0.9,
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
});