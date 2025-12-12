import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, AppState, StatusBar, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import NoInternetScreen from './src/screens/noInternet/NoInternet';
import CustomSplashScreen from './src/screens/splash/SplashScreen';
import { TranslationProvider } from './src/components/TranslationProvider';
import { ERP_COLOR_CODE } from './src/utils/constants';
import useNetworkStatus from './src/hooks/useNetworkStatus';

import {
  requestUserPermission,
  onMessageListener,
  setBackgroundMessageHandler,
  onNotificationOpenedAppListener,
  checkInitialNotification,
} from './src/firebase/firebaseService';
import { clearAllTempFiles } from './src/utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TermsAndConsent from './src/screens/TermsConditions.tsx/TermsCondition';
import FullViewLoader from './src/components/loader/FullViewLoader';

const App = () => {
  const isConnected = useNetworkStatus();
  const [isSplashVisible, setSplashVisible] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const checkAcceptance = async () => {
      const value = await AsyncStorage.getItem("TERMS_ACCEPTED");
      if (value === "true") {
        setAccepted(true);
      }
      setIsLoading(false);
    };

    checkAcceptance();
  }, []);

  const handleAccept = () => {
    setAccepted(true); // Move to main app
  };


  useEffect(() => {
    clearAllTempFiles();
  }, []);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'background') {
        clearAllTempFiles(); 
      }
    });

    return () => subscription.remove();
  }, []);
  useEffect(() => {
    requestUserPermission();
    setBackgroundMessageHandler();
    const unsubscribeForeground = onMessageListener(remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title ?? 'New Message',
        remoteMessage.notification?.body ?? JSON.stringify(remoteMessage.data),
      );
    });

    const unsubscribeBackground = onNotificationOpenedAppListener(remoteMessage => {
      Alert.alert('App opened from background', JSON.stringify(remoteMessage.data));
    });

    checkInitialNotification(remoteMessage => {
      Alert.alert('App opened from quit state', JSON.stringify(remoteMessage.data));
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

   if (isLoading) {
    return (
      <TranslationProvider>
        <Provider store={store}>
        <View style={{flex: 1}}>
          <FullViewLoader />
        </View>
        </Provider>  
      </TranslationProvider>
    );
  }

  // If not accepted → show Terms page
  if (!accepted) {
    return <TermsAndConsent onAccept={handleAccept} />;
  }

  if (!isConnected) {
    return (
      <TranslationProvider>
        <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} barStyle="light-content" />
        <SafeAreaView edges={['top']} style={{ backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR }} />
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
          <NoInternetScreen onRetry={() => {}} />
        </SafeAreaView>
      </TranslationProvider>
    );
  }

  if (isSplashVisible) {
    return (
      <TranslationProvider>
      <Provider store={store}>
      <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} barStyle="light-content" />
              <SafeAreaView edges={['top']} style={{ backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR }} />
              <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
                <CustomSplashScreen onFinish={() => setSplashVisible(false)} />
              </SafeAreaView>
      </Provider>
        
      </TranslationProvider>
    );
  }

  return (
    <TranslationProvider>
      <Provider store={store}>
        <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} barStyle="light-content" />
        <SafeAreaView edges={['top']} style={{ backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR }} />
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </Provider>
    </TranslationProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
  },
});

export default App;
