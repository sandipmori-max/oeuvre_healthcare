import React, { useEffect, useState } from 'react';
 import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuthStateThunk } from '../store/slices/auth/thunk';
import DevERPService from '../services/api/deverp';
import AuthNavigator from './AuthNavigator';
import StackNavigator from './StackNavigator';
import FullViewLoader from '../components/loader/FullViewLoader';
// import DeviceInfo from 'react-native-device-info';
import CustomAlert from '../components/alert/CustomAlert';
import { generateGUID } from '../utils/helpers';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { isTokenValid, requestLocationPermissions } from '../utils/helpers';
// import { syncLocationThunk } from '../store/slices/location/thunk';
// import Geolocation from '@react-native-community/geolocation';
// const { BatteryOptimization } = NativeModules;
// console.log('🚀 ~ BatteryOptimization:', BatteryOptimization);

// export async function checkBatteryOptimization() {
//   try {
//     const isIgnoring = await BatteryOptimization?.isIgnoringBatteryOptimizations();
//     console.log('🚀 ~ checkBatteryOptimization ~ isIgnoring:', isIgnoring);
//     if (!isIgnoring) {
//       Alert.alert('Battery Optimization', 'Please disable battery optimization for this app.', [
//         {
//           text: 'Open Settings',
//           onPress: async () => {
//             try {
//               const result = await BatteryOptimization.requestIgnoreBatteryOptimizations();
//               console.log('User request result:', result);
//             } catch (error) {
//               console.error('Battery optimization request failed:', error);
//             }
//           },
//         },
//         { text: 'Cancel', style: 'cancel' },
//       ]);
//     }
//   } catch (e) {
//     console.error('Battery optimization check failed:', e);
//   }
// }

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, accounts } = useAppSelector(state => state.auth);

  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
    const [deviceId, setDeviceId] = useState<string>('');
  
  const [modalClose, setModalClose] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });
 
 

const app_id = generateGUID();

useEffect(() => {
  const fetchDeviceName = async () => {
    const name = await DeviceInfo.getDeviceName();
    let appid = await AsyncStorage.getItem('appid');
    if (!appid) {
      appid = app_id;
      await AsyncStorage.setItem('appid', appid);
    }
    console.log("🚀 ~ fetchDeviceName ~ appid:", appid)

    setDeviceId(name);
    await AsyncStorage.setItem('device', name);
    DevERPService.initialize();
    DevERPService.setAppId(appid);
    DevERPService.setDevice(name);

    dispatch(checkAuthStateThunk());
  };

  fetchDeviceName();
}, [dispatch]);

 
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