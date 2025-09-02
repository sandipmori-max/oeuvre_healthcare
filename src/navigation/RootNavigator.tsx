import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuthStateThunk } from '../store/slices/auth/thunk';
import DevERPService from '../services/api/deverp';
import AuthNavigator from './AuthNavigator';
import StackNavigator from './StackNavigator';
import FullViewLoader from '../components/loader/FullViewLoader';
import DeviceInfo from 'react-native-device-info';
import CustomAlert from '../components/alert/CustomAlert';
import { isTokenValid } from '../utils/helpers';
import { syncLocationThunk } from '../store/slices/location/thunk';
import Geolocation from '@react-native-community/geolocation';
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

  const getCurrentLocation = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude},${longitude}`);
        },
        error => {
          console.error('Location error', error);
          reject(error);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  };

  useEffect(() => {
    DevERPService.initialize();
    dispatch(checkAuthStateThunk());
  }, [dispatch]);

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

      if (isAuthenticated) {
        if (enabled) {
          setHasSyncedDisabledLocation(false);

          const hasPermission = await requestLocationPermission();
          if (!hasPermission) return;

          try {
            const location = await getCurrentLocation();

            const validAccounts = accounts.filter(u => isTokenValid(u?.user?.tokenValidTill || ''));

            if (validAccounts.length > 0) {
              for (const acc of validAccounts) {
                await dispatch(
                  syncLocationThunk({
                    token: acc?.user?.token || '',
                    location,
                  }),
                );
              }
            } else {
              console.log('⚠️ No valid token found');
            }
          } catch (err) {
            console.log('Location fetch error:', err);
          }
        } else {
          if (!hasSyncedDisabledLocation) {
            console.log('📍 Location is disabled - syncing once');
            const location = 'disabled';

            accounts.forEach(u => {
              if (isTokenValid(u?.user?.tokenValidTill || '')) {
                dispatch(
                  syncLocationThunk({
                    token: u?.user?.token || '',
                    location,
                  }),
                );
              }
            });

            setHasSyncedDisabledLocation(true);
          }
        }
      }
    };

    checkLocation();

    const interval = setInterval(checkLocation, 18000);
    return () => clearInterval(interval);
  }, [locationEnabled, accounts, dispatch, hasSyncedDisabledLocation]);

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
