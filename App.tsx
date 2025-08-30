import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import { StatusBar } from 'react-native';

import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import NoInternetScreen from './src/screens/noInternet/NoInternet';
import useNetworkStatus from './src/hooks/useNetworkStatus';
import CustomSplashScreen from './src/screens/splash/SplashScreen';
import CustomAlert from './src/components/alert/CustomAlert';
import { TranslationProvider } from './src/components/TranslationProvider';

import './src/i18n';
import { ERP_COLOR_CODE } from './src/utils/constants';

const App = () => {
  const isConnected = useNetworkStatus();
  const [isSplashVisible, setSplashVisible] = useState(true);

  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [modalCLose, setModalClose] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

 useEffect(() => {
  const checkLocation = async () => {
    const enabled = await DeviceInfo.isLocationEnabled();

    if (locationEnabled === null) {
      if (!enabled) {
        setAlertConfig({
          title: 'Location Status',
          message:
            'To continue using our services, please enable location access. Without location permissions, you won’t be able to use this app',
          type: 'error',
        });
        setAlertVisible(true);
      }
      setLocationEnabled(enabled);
      return;
    }

    if (enabled !== locationEnabled) {
      setAlertConfig({
        title: 'Location Status',
        message: enabled
          ? `Location is now enabled`
          : 'To continue using our services, please enable location access. Without location permissions, you won’t be able to use this app',
        type: enabled ? 'success' : 'error',
      });
      setAlertVisible(true);
    }

    setModalClose(enabled);
    setLocationEnabled(enabled);
  };

  checkLocation();

  const interval = setInterval(checkLocation, 1000);
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
    <TranslationProvider>
      <Provider store={store}>
        <NavigationContainer>
          <StatusBar backgroundColor={ERP_COLOR_CODE.ERP_APP_COLOR} />
          <RootNavigator />
        </NavigationContainer>
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => {
            if(modalCLose){
              setAlertVisible(false)
            }
          }}
          actionLoader={undefined}
        />
      </Provider>
    </TranslationProvider>
  );
};

export default App;
