import React, { useEffect, useState, useRef } from 'react';
import { PermissionsAndroid, Platform, NativeModules, Alert , } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuthStateThunk } from '../store/slices/auth/thunk';
import DevERPService from '../services/api/deverp';
import AuthNavigator from './AuthNavigator';
import StackNavigator from './StackNavigator';
import FullViewLoader from '../components/loader/FullViewLoader';
// import DeviceInfo from 'react-native-device-info';
import CustomAlert from '../components/alert/CustomAlert';
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
  const [modalClose, setModalClose] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  const [hasSyncedDisabledLocation, setHasSyncedDisabledLocation] = useState(false);

  const lastSyncedLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  const RADIUS_FEET = 30;
  const FEET_TO_METERS = 0.3048;
  // const RADIUS_IN_METERS = RADIUS_FEET * FEET_TO_METERS;

  // const requestLocationPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //       {
  //         title: 'Location Permission',
  //         message: 'We need access to your location to sync with ERP',
  //         buttonPositive: 'OK',
  //       },
  //     );
  //     return granted === PermissionsAndroid.RESULTS.GRANTED;
  //   }
  //   return true;
  // };

  // const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  //   return new Promise((resolve, reject) => {
  //     Geolocation.getCurrentPosition(
  //       position => {
  //         const { latitude, longitude } = position.coords;
  //         resolve({ lat: latitude, lng: longitude });
  //       },
  //       error => reject(error),
  //       {
  //         enableHighAccuracy: false,
  //         timeout: 15000,
  //         maximumAge: 10000,
  //       },
  //     );
  //   });
  // };

  // const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  //   const R = 6371000;
  //   const toRad = (value: number) => (value * Math.PI) / 180;

  //   const dLat = toRad(lat2 - lat1);
  //   const dLon = toRad(lon2 - lon1);

  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   return R * c;
  // };

  useEffect(() => {
    DevERPService.initialize();
    dispatch(checkAuthStateThunk());
  }, [dispatch]);

  // useEffect(() => {
  //   const checkLocation = async () => {
  //     //checkBatteryOptimization();
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
  //           const newLocation = await getCurrentLocation();
  //           console.log('🚀 ~ checkLocation ~ newLocation:', newLocation);

  //           if (lastSyncedLocationRef.current) {
  //             const distance = getDistance(
  //               lastSyncedLocationRef.current.lat,
  //               lastSyncedLocationRef.current.lng,
  //               newLocation.lat,
  //               newLocation.lng,
  //             );

  //             console.log(
  //               `📏 Distance from circle center: ${distance.toFixed(
  //                 2,
  //               )}m (Threshold: ${RADIUS_IN_METERS}m)`,
  //             );

  //             if (distance < RADIUS_IN_METERS) {
  //               console.log(`⏸ Inside ${RADIUS_FEET}ft circle — skipping sync`);
  //               return;
  //             }
  //           }

  //           lastSyncedLocationRef.current = newLocation;

  //           if (accounts.length > 0) {
  //             if (Platform.OS === 'android') {
  //               requestLocationPermissions().then(granted => {
  //                 if (granted && isAuthenticated) {
  //                   const tokens = accounts?.map(u => u.user.token);
  //                   NativeModules.LocationModule.setUserTokens(tokens);
  //                   NativeModules.LocationModule?.startService?.();
  //                 }
  //               });
  //             }
  //           }
  //         } catch (err) {
  //           console.log('Location fetch error:', err);
  //         }
  //       } else {
  //         if (!hasSyncedDisabledLocation) {
  //           console.log('📍 Location is disabled - syncing once');
  //           const location = 'disabled';

  //           accounts.forEach(u => {
  //             if (isTokenValid(u?.user?.tokenValidTill || '')) {
  //               dispatch(
  //                 syncLocationThunk({
  //                   token: u?.user?.token || '',
  //                   location,
  //                 }),
  //               );
  //             }
  //           });

  //           setHasSyncedDisabledLocation(true);
  //         }
  //       }
  //     }
  //   };

  //   checkLocation();

  //   const interval = setInterval(checkLocation, 18000);
  //   return () => clearInterval(interval);
  // }, [locationEnabled, accounts, dispatch, isAuthenticated, hasSyncedDisabledLocation]);
  // console.log('🚀 ~ RootNavigator ~ granted:', accounts);

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
