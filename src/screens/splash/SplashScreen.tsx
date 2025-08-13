import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import { ERP_ICON } from '../../assets';
import { styles } from './splash_style';

interface Props {
  onFinish: () => void;
}


const CustomSplashScreen: React.FC<Props> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden />
      <View style={styles.logoWrapper}>
        <Image
         source={ERP_ICON.APP_LOGO}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>Welcome to DevERP</Text>
      <Text style={styles.subtitle}>Your business, simplified.</Text>
    </Animated.View>
  );
};

export default CustomSplashScreen;
