import React, { useEffect, useRef } from 'react';
import { Image, Text, Animated } from 'react-native';
import { styles } from '../login_style';
import { ERP_ICON } from '../../../../assets';

const LoginHeader = ({ isAddingAccount, t }: { isAddingAccount: boolean; t: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <Image source={ERP_ICON.APP_LOGO} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>
        {isAddingAccount ? t('auth.addAccount') : t('auth.welcomeDevERP')}
      </Text>
      <Text style={styles.subtitle}>
        {isAddingAccount ? t('auth.signInToAddAccount') : t('auth.signInToAccount')}
      </Text>
    </Animated.View>
  );
};

export default LoginHeader;
