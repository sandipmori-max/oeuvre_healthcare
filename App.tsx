import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { StatusBar, StyleSheet } from 'react-native';

import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import NoInternetScreen from './src/screens/noInternet/NoInternet';
import useNetworkStatus from './src/hooks/useNetworkStatus';
import CustomSplashScreen from './src/screens/splash/SplashScreen';
import { TranslationProvider } from './src/components/TranslationProvider';

import './src/i18n';
import { ERP_COLOR_CODE } from './src/utils/constants';
import { SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const isConnected = useNetworkStatus();
  const [isSplashVisible, setSplashVisible] = useState(true);

  if (!isConnected) {
    return (
      <TranslationProvider>
        <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} barStyle="light-content" />
        <SafeAreaView edges={['top']} style={{ backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR }} />

        <SafeAreaView
          edges={['top', 'left', 'right', 'bottom']}
          style={styles.safeArea}
        >
          <NoInternetScreen onRetry={() => {}} />
        </SafeAreaView>
      </TranslationProvider>
    );
  }

  if (isSplashVisible) {
    return (
      <TranslationProvider>
        <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} barStyle="light-content" />
        <SafeAreaView edges={['top']} style={{ backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR }} />

        <SafeAreaView
          edges={['top', 'left', 'right', 'bottom']}
          style={styles.safeArea}
        >
          <CustomSplashScreen onFinish={() => setSplashVisible(false)} />
        </SafeAreaView>
      </TranslationProvider>
    );
  }

  return (
    <TranslationProvider>
      <Provider store={store}>
        <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} barStyle="light-content" />
        <SafeAreaView edges={['top']} style={{ backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR }} />
        <SafeAreaView
          edges={['left', 'right', 'bottom']}
          style={styles.safeArea}
        >
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
