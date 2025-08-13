import React, { useEffect, useState }  from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import DeviceInfo from 'react-native-device-info';

import {store} from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import NoInternetScreen from './src/screens/noInternet/NoInternet';
import useNetworkStatus from './src/hooks/useNetworkStatus';
import CustomSplashScreen from './src/screens/splash/SplashScreen';
import CustomAlert from './src/components/alert/CustomAlert';
import { TranslationProvider } from './src/components/TranslationProvider';

import './src/i18n';

const App = () => {
  const isConnected = useNetworkStatus();
  const [isSplashVisible, setSplashVisible] = useState(true);

  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  useEffect(() => {
    const checkLocation = async () => {
      const enabled = await DeviceInfo.isLocationEnabled();

      if (locationEnabled !== null && enabled !== locationEnabled) {
        setAlertConfig({
          title: 'Location Status',
          message: `Location is now ${enabled ? 'enabled' : 'disabled'}`,
          type: enabled ? 'success' : 'error',
        });
        setAlertVisible(true);
      } 
      setLocationEnabled(enabled);
    };

    const interval = setInterval(() => {
      checkLocation();
    }, 10000);

    return () => clearInterval(interval);
  }, [locationEnabled]);

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
    <TranslationProvider >
      <Provider store={store}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertVisible(false)}
        />
      </Provider>
    </TranslationProvider>
  );
};

export default App;
