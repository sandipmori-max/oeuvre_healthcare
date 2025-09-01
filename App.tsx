import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { StatusBar } from 'react-native';

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
        <NoInternetScreen onRetry={() => {}} />
      </TranslationProvider>
    );
  }

  if (isSplashVisible) {
    return (
      <TranslationProvider>
        <CustomSplashScreen onFinish={() => setSplashVisible(false)} />
      </TranslationProvider>
    );
  }

  return (
    <TranslationProvider>
      <Provider store={store}>
        <NavigationContainer>
          <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} />
          <RootNavigator />
        </NavigationContainer>
      </Provider>
    </TranslationProvider>
  );
};

export default App;
