import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Image,
  StatusBar,
  Animated,
  Easing,
  Text,
  useWindowDimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { ERP_ICON } from "../../assets";
import { styles } from "./splash_style";
import { SplashProps } from "./types";
import { useAppSelector } from "../../store/hooks";
import useTranslations from "../../hooks/useTranslations";
import { firstLetterUpperCase } from "../../utils/helpers";

const CustomSplashScreen: React.FC<SplashProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const { height, width } = useWindowDimensions();  
  const isLandscape = width > height;
  const theme = useAppSelector((state) => state?.theme.mode);
  const { t } = useTranslations();
  const { user } = useAppSelector((state) => state.auth);

  // 🔥 Dynamic Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 700,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={
        theme === "dark"
          ? ["#000000", "#1a1a1a"]
          : ["#4c669f", "#3b5998", "#192f6a"]
      }
      style={styles.container}
    >
      <StatusBar hidden />

      {isLandscape ? (
        <>
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: "50%",
              justifyContent:'center',
              alignContent:'center',
              alignItems:'center'
             }}>
              <Animated.View
                style={[
                  styles.logoWrapper,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <Image
                  source={ ERP_ICON.DEV_APP_LOGO}
                  style={[styles.logo, {
                    height: 80,
                    width: 80
                  }]}
                  resizeMode="contain"
                />
              </Animated.View>

              {user?.name && (
                <Animated.Text
                  style={[
                    styles.helloTitle,
                    {
                      transform: [{ translateY: textTranslateY }],
                      color: "#fff",
                    },
                  ]}
                >
                  {greeting}, {firstLetterUpperCase(user?.name)}
                </Animated.Text>
              )}
            </View>

            <View style={{ width: "50%",   
              alignContent:'center',
              alignItems:'center' }}>
              {/* 🔹 Company Name */}
              <Animated.Text
                style={[
                  styles.title,
                  {
                    transform: [{ translateY: textTranslateY }],
                    color: "#fff",
                  },
                ]}
              >
                {user?.companyName
                  ? `Welcome to\n${user.companyName}`
                  : t("text.text53")}
              </Animated.Text>

              {/* 🔹 Subtitle */}
              <Animated.Text
                style={[
                  styles.subtitle,
                  {
                    opacity: subtitleOpacity,
                    color: "#ddd",
                  },
                ]}
              >
                {t("text.text54")}
              </Animated.Text>

              {/* 🔹 Powered By */}
              <Animated.Text
                style={[
                  styles.poweredBy,
                  {
                    opacity: subtitleOpacity,
                    color: "#aaa",
                  },
                ]}
              >
                Powered by - DevERP Solutions Pvt. Ltd.
              </Animated.Text>
            </View>
          </View>
        </>
      ) : (
        <>
          {/* 🔹 Logo */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={ ERP_ICON.DEV_APP_LOGO}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 🔹 Greeting */}
          {user?.name && (
            <Animated.Text
              style={[
                styles.helloTitle,
                {
                  transform: [{ translateY: textTranslateY }],
                  color: "#fff",
                },
              ]}
            >
              {greeting}, {firstLetterUpperCase(user?.name)}
            </Animated.Text>
          )}

          {/* 🔹 Company Name */}
          <Animated.Text
            style={[
              styles.title,
              {
                transform: [{ translateY: textTranslateY }],
                color: "#fff",
              },
            ]}
          >
            {user?.companyName
              ? `Welcome to\n${user.companyName}`
              : t("text.text53")}
          </Animated.Text>

          {/* 🔹 Subtitle */}
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: subtitleOpacity,
                color: "#ddd",
              },
            ]}
          >
            {t("text.text54")}
          </Animated.Text>

          {/* 🔹 Powered By */}
          <Animated.Text
            style={[
              styles.poweredBy,
              {
                opacity: subtitleOpacity,
                color: "#aaa",
              },
            ]}
          >
            Powered by - DevERP Solutions Pvt. Ltd.
          </Animated.Text>
        </>
      )}
    </LinearGradient>
  );
};

export default CustomSplashScreen;
