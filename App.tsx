import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';

import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import NoInternetScreen from './src/screens/noInternet/NoInternet';
import useNetworkStatus from './src/hooks/useNetworkStatus';
import CustomSplashScreen from './src/screens/splash/SplashScreen';
import { TranslationProvider } from './src/components/TranslationProvider';

import './src/i18n';
import { ERP_COLOR_CODE } from './src/utils/constants';

const App = () => {
  const isConnected = useNetworkStatus();
  const [isSplashVisible, setSplashVisible] = useState(true);

  if (!isConnected) {
    return (
      <TranslationProvider>
        <SafeAreaView style={styles.safeArea}>
          <NoInternetScreen onRetry={() => {}} />
        </SafeAreaView>
      </TranslationProvider>
    );
  }

  if (isSplashVisible) {
    return (
      <TranslationProvider>
        <SafeAreaView style={styles.safeArea}>
          <CustomSplashScreen onFinish={() => setSplashVisible(false)} />
        </SafeAreaView>
      </TranslationProvider>
    );
  }

  return (
    <TranslationProvider>
      <Provider store={store}>
        <SafeAreaView style={styles.safeArea}>
          <NavigationContainer>
            <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} barStyle="light-content" />
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
    backgroundColor: '#fff',
  },
});

export default App;
