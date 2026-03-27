import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  StatusBar,
  StyleSheet,
  View,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { store } from "./src/store/store";
import RootNavigator from "./src/navigation/RootNavigator";
import NoInternetScreen from "./src/screens/noInternet/NoInternet";
import CustomSplashScreen from "./src/screens/splash/SplashScreen";
import { TranslationProvider } from "./src/components/TranslationProvider";
import { ERP_COLOR_CODE } from "./src/utils/constants";
import useNetworkStatus from "./src/hooks/useNetworkStatus";

import {
  requestUserPermission,
  onMessageListener,
  setBackgroundMessageHandler,
  onNotificationOpenedAppListener,
  checkInitialNotification,
} from "./src/firebase/firebaseService";

import { clearAllTempFiles } from "./src/utils/helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FullViewLoader from "./src/components/loader/FullViewLoader";
import TermsAndConsent from "./src/screens/TermsConditions/TermsCondition";
import { useAppSelector } from "./src/store/hooks";
// import ExitBottomSheet from "./src/components/ExitBottomSheet";
// import { useAppUpdate } from "./src/hooks/useAppUpdate";
// import UpdateModal from "./src/components/appUpdate/UpdateModal";

const App = () => {
  // const update = useAppUpdate();

  return (
    <Provider store={store}>
      <TranslationProvider>
        <AppContent />
        {/* <ExitBottomSheet /> */}
        {/* <UpdateModal
          visible={update.visible}
          storeUrl={update.storeUrl}
          forceUpdate={update.forceUpdate}
          onSkip={update.onSkip}
        /> */}
      </TranslationProvider>
    </Provider>
  );
};

const AppContent = () => {
  const { width, height } = useWindowDimensions();

  const isConnected = useNetworkStatus();
  const theme = useAppSelector((state) => state?.theme?.mode);

  const statusBarColor =
    theme === "dark" ? "#000000" : ERP_COLOR_CODE.ERP_APP_COLOR;

  const barStyle = "light-content";

  const [isSplashVisible, setSplashVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  // 🔥 Splash Animation
  const splashOpacity = useRef(new Animated.Value(1)).current;

  // 🔥 App Animation (BOTTOM → TOP)
  const appOpacity = useRef(new Animated.Value(0)).current;
  const appTranslateY = useRef(new Animated.Value(120)).current;

  // 🔹 Check Terms
  useEffect(() => {
    const checkAcceptance = async () => {
      const value = await AsyncStorage.getItem("TERMS_ACCEPTED");
      if (value === "true") setAccepted(true);
      setIsLoading(false);
    };
    checkAcceptance();
  }, []);

  const handleAccept = async () => {
    await AsyncStorage.setItem("TERMS_ACCEPTED", "true");
    setAccepted(true);
  };

  // 🔹 Clear temp files
  useEffect(() => {
    clearAllTempFiles();
  }, []);

  // 🔹 AppState
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background") {
        clearAllTempFiles();
      }
    });

    return () => subscription.remove();
  }, []);

  // 🔹 Notifications
  useEffect(() => {
    requestUserPermission();
    setBackgroundMessageHandler();

    const unsubscribeForeground = onMessageListener((remoteMessage) => {
      Alert.alert(
        remoteMessage?.notification?.title ?? "New Message",
        remoteMessage?.notification?.body ??
          JSON.stringify(remoteMessage?.data),
      );
    });

    const unsubscribeBackground = onNotificationOpenedAppListener(
      (remoteMessage) => {
        Alert.alert(
          "App opened from background",
          JSON.stringify(remoteMessage?.data),
        );
      },
    );

    checkInitialNotification((remoteMessage) => {
      Alert.alert(
        "App opened from quit state",
        JSON.stringify(remoteMessage?.data),
      );
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  // 🔥 Loader
  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <FullViewLoader />
      </View>
    );
  }

  // 🔥 Terms
  if (!accepted) {
    return <TermsAndConsent onAccept={handleAccept} />;
  }

  return (
    <>
      <StatusBar backgroundColor={statusBarColor} barStyle={barStyle} />

      {/* 🔥 MAIN APP */}
      <Animated.View
        style={{
          flex: 1,
          width: width,
          opacity: appOpacity,
          transform: [{ translateY: appTranslateY }],
        }}
      >
        <SafeAreaView
          edges={["top"]}
          style={{ backgroundColor: statusBarColor }}
        />

        <SafeAreaView
          edges={["left", "right", "bottom"]}
          style={[styles.safeArea]}
        >
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </Animated.View>

      {/* 🔥 No Internet */}
      {!isConnected && (
        <View style={[StyleSheet.absoluteFillObject, { zIndex: 1000 }]}>
          <NoInternetScreen onRetry={() => {}} />
        </View>
      )}

      {/* 🔥 Splash */}
      {isSplashVisible && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity: splashOpacity,
              zIndex: 999,
            },
          ]}
        >
          <CustomSplashScreen
            onFinish={() => {
              // 1️⃣ Splash Fade Out
              Animated.timing(splashOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }).start(() => {
                setSplashVisible(false);

                // 2️⃣ App Slide Up Animation 🔥
                setTimeout(() => {
                  Animated.parallel([
                    Animated.timing(appOpacity, {
                      toValue: 1,
                      duration: 500,
                      easing: Easing.out(Easing.exp),
                      useNativeDriver: true,
                    }),
                    Animated.timing(appTranslateY, {
                      toValue: 0,
                      duration: 500,
                      easing: Easing.out(Easing.exp),
                      useNativeDriver: true,
                    }),
                  ]).start();
                }, 100);
              });
            }}
          />
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
  },
});

export default App;
