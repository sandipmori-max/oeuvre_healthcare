import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, NativeModules, Alert, StatusBar } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuthStateThunk } from '../store/slices/auth/thunk';
import DevERPService from '../services/api/deverp';
import AuthNavigator from './AuthNavigator';
import StackNavigator from './StackNavigator';
import FullViewLoader from '../components/loader/FullViewLoader';
import DeviceInfo from 'react-native-device-info';
import CustomAlert from '../components/alert/CustomAlert';
import { generateGUID } from '../utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestLocationPermissions } from '../utils/helpers';
import { ERP_COLOR_CODE } from '../utils/constants';
const { BatteryOptimization } = NativeModules;
console.log('🚀 ~ BatteryOptimization:', BatteryOptimization);

export async function checkBatteryOptimization() {
  try {
    const isIgnoring = await BatteryOptimization?.isIgnoringBatteryOptimizations();
    console.log('🚀 ~ checkBatteryOptimization ~ isIgnoring:', isIgnoring);
    if (!isIgnoring) {
      Alert.alert('Battery Optimization', 'Please disable battery optimization for this app.', [
        {
          text: 'Open Settings',
          onPress: async () => {
            try {
              const result = await BatteryOptimization.requestIgnoreBatteryOptimizations();
              console.log('User request result:', result);
            } catch (error) {
              console.error('Battery optimization request failed:', error);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  } catch (e) {
    console.error('Battery optimization check failed:', e);
  }
}

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, accounts } = useAppSelector(state => state.auth);

  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
 
  const [modalClose, setModalClose] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  const [hasSyncedDisabledLocation, setHasSyncedDisabledLocation] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need access to your location to sync with ERP',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const app_id = generateGUID();

  useEffect(() => {
    const fetchDeviceName = async () => {
      const name = await DeviceInfo.getDeviceName();

      let appid = await AsyncStorage.getItem('appid');
      if (!appid) {
        appid = app_id;
        await AsyncStorage.setItem('appid', appid);
      }
      await AsyncStorage.setItem('device', name);

      DevERPService.initialize();
      DevERPService.setAppId(appid);
      DevERPService.setDevice(name);

      dispatch(checkAuthStateThunk());
    };

    fetchDeviceName();
  }, [dispatch]);

  // for location debug -----------
  // useEffect(() => {
  //   const checkLocation = async () => {
  //     // checkBatteryOptimization();
  //     const enabled = await DeviceInfo.isLocationEnabled();

  //     if (locationEnabled === null) {
  //       if (!enabled) {
  //         setAlertConfig({
  //           title: 'Location Status',
  //           message:
  //             'To continue using our services, please enable location access. Without location permissions, you won’t be able to use this app',
  //           type: 'error',
  //         });
  //         setAlertVisible(true);
  //       }
  //       setLocationEnabled(enabled);
  //       return;
  //     }

  //     if (enabled !== locationEnabled) {
  //       setAlertConfig({
  //         title: 'Location Status',
  //         message: enabled
  //           ? `Location is now enabled`
  //           : 'To continue using our services, please enable location access. Without location permissions, you won’t be able to use this app',
  //         type: enabled ? 'success' : 'error',
  //       });
  //       setAlertVisible(true);
  //     }

  //     setModalClose(enabled);
  //     setLocationEnabled(enabled);

  //     if (isAuthenticated) {
  //       if (enabled) {
  //         setHasSyncedDisabledLocation(false);

  //         const hasPermission = await requestLocationPermission();
  //         if (!hasPermission) return;

  //         try {
  //           if (accounts.length > 0) {
  //             if (Platform.OS === 'android') {
  //               requestLocationPermissions().then(granted => {
  //                 if (granted && isAuthenticated) {
  //                   const tokens = accounts?.map(u => u.user.token);
  //                   NativeModules.LocationModule.setUserTokens(tokens);
  //                   NativeModules.LocationModule?.startService();
  //                 }
  //               });
  //             }
  //           }
  //         } catch (err) {
  //           console.log('Location fetch error:', err);
  //         }
  //       }
  //     }
  //   };

  //   checkLocation();

  //   const interval = setInterval(checkLocation, 18000);
  //   return () => clearInterval(interval);
  // }, [locationEnabled, accounts, dispatch, isAuthenticated, hasSyncedDisabledLocation]);
 
  if (isLoading) {
    return <FullViewLoader />;
  }

  return (
    <>
      {isAuthenticated ? <StackNavigator /> : <AuthNavigator />}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          if (modalClose) {
            setAlertVisible(false);
          }
        }}
        actionLoader={undefined}
      />
    </>
  );
};

export default RootNavigator;
