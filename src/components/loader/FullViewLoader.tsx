import { View, Text, Animated, Easing, Dimensions, Platform } from 'react-native';
import React, { useEffect, useRef } from 'react';
import FastImage from 'react-native-fast-image';

import { styles } from './loader_style';
import { useAppSelector } from '../../store/hooks';
import { useTranslation } from 'react-i18next';
import { ERP_COLOR_CODE } from '../../utils/constants';
import { useBaseLink } from '../../hooks/useBaseLink';
import TypingDots from '../../screens/dashboard/tabs/home/TypingDots';

const FullViewLoader = ({ isShowTop = true }) => {
  const { t } = useTranslation();
  const theme = useAppSelector(state => state?.theme.mode);
  const baseLink = useBaseLink();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in text animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Top-down bouncing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -30,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: 1000,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation (optional)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <>
      {isShowTop && (
        <View
          style={{
            height: Platform.OS === 'ios' ?  16  : 6, 
            width: '100%',
            backgroundColor: theme === 'dark' ? 'black' : ERP_COLOR_CODE.ERP_APP_COLOR,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        />
      )}

      <View
        style={[
          styles.loadingContainer,
          theme === 'dark' && { backgroundColor: 'black' },
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ translateY: translateY }, { scale: scaleAnim }],
          }}
        >
          <FastImage
            source={{
              uri: `${baseLink}fileupload/1/InvoiceByConfig/1/logo.jpg`,
            }}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
              color: theme === 'dark' ? '#fff' : '#000',
              marginTop: 20,
            },
          ]}
        >
          <TypingDots visible={true} />
          {/* {t('test6')} */}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: fadeAnim,
              color: theme === 'dark' ? '#aaa' : '#555',
              marginTop: 4,
            },
          ]}
        >
          {t('test7')}
        </Animated.Text>
      </View>
    </>
  );
};

export default FullViewLoader;