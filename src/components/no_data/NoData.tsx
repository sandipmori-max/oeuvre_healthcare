import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFocusEffect } from '@react-navigation/native';

import { ERP_GIF } from '../../assets';
import { styles } from './no_data_style';
import { useAppSelector } from '../../store/hooks';

const NoData = () => {
  const theme = useAppSelector(state => state?.theme.mode);

  const opacity = useRef(new Animated.Value(0)).current;

  const imageTranslateY = useRef(new Animated.Value(20)).current;
  const titleTranslateX = useRef(new Animated.Value(-20)).current;
  const subtitleTranslateX = useRef(new Animated.Value(20)).current;

  const [shouldRender, setShouldRender] = useState(false);

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0);
      imageTranslateY.setValue(200);
      titleTranslateX.setValue(-200);
      subtitleTranslateX.setValue(200);

      setShouldRender(true);

      return () => {
        setShouldRender(false);
      };
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(imageTranslateY, {
        toValue: 0,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateX, {
        toValue: 0,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleTranslateX, {
        toValue: 0,
        duration: 580,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        theme === 'dark' && { backgroundColor: 'black' },
        { opacity },
      ]}
    >
      {/* GIF */}
      <Animated.View
        style={{ transform: [{ translateY: imageTranslateY }] }}
      >
        <FastImage
          source={ERP_GIF.NO_DATA}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>

      {/* TITLE */}
      <Animated.Text
        style={[
          styles.title,
          { transform: [{ translateX: titleTranslateX }] },
        ]}
      >
        No Data Found
      </Animated.Text>

      {/* SUBTITLE */}
      <Animated.Text
        style={[
          styles.subtitle,
          { transform: [{ translateX: subtitleTranslateX }] },
        ]}
      >
        Oops! No data available. Please refresh or check again later.
      </Animated.Text>
    </Animated.View>
  );
};

export default NoData;
