import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  PermissionsAndroid,
  Platform,
  NativeModules,
  AppState,
  Linking,
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuthStateThunk } from '../store/slices/auth/thunk';
import DevERPService from '../services/api/deverp';
import AuthNavigator from './AuthNavigator';
import StackNavigator from './StackNavigator';
import FullViewLoader from '../components/loader/FullViewLoader';
import DeviceInfo from 'react-native-device-info';
import CustomAlert from '../components/alert/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ERP_COLOR_CODE } from '../utils/constants';
import { changeLanguage } from '../i18n';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// ------------------------- Location Permission Helper -------------------------
export async function requestLocationPermissions(): Promise<
  'granted' | 'foreground-only' | 'denied' | 'blocked'
> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
    ]);

    if (
      granted['android.permission.ACCESS_FINE_LOCATION'] ===
      PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.ACCESS_COARSE_LOCATION'] ===
      PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.ACCESS_BACKGROUND_LOCATION'] ===
      PermissionsAndroid.RESULTS.GRANTED
    ) return 'granted';

    if (
      granted['android.permission.ACCESS_FINE_LOCATION'] ===
      PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.ACCESS_COARSE_LOCATION'] ===
      PermissionsAndroid.RESULTS.GRANTED
    ) return 'foreground-only';

    if (
      granted['android.permission.ACCESS_FINE_LOCATION'] ===
      PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
      granted['android.permission.ACCESS_COARSE_LOCATION'] ===
      PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    ) return 'blocked';

    return 'denied';
  } else {
    // iOS logic
    let status = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
    console.log("status----------------------1---------------------", status)
    if (status === RESULTS.GRANTED) return 'granted';
    console.log("status----------------------2---------------------", status)
    if (status === RESULTS.BLOCKED) return 'blocked';
    console.log("status-----------------------3--------------------", status)

    // Request foreground permission first
    let foregroundStatus = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    console.log("foregroundStatus---------------------4----------------------", foregroundStatus)

    if (foregroundStatus === RESULTS.DENIED) {

      foregroundStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      console.log("foregroundStatus---------------------5----------------------", foregroundStatus)

    }

    if (foregroundStatus === RESULTS.GRANTED || foregroundStatus === RESULTS.LIMITED) {
      console.log("foregroundStatus---------------------6----------------------", foregroundStatus)

      // Now ask for "Always" if needed
      status = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      console.log("status---------------------7----------------------", status)

      if (status === RESULTS.GRANTED) return 'granted';
      console.log("status----------------------8---------------------", status)

      return 'foreground-only';
    }
    console.log("status-----------------------9--------------------", status)

    if (foregroundStatus === RESULTS.BLOCKED) return 'blocked';
    console.log("status------------------------10-------------------", status)

    return 'denied';
  }
}

// ------------------------- RootNavigator -------------------------
const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, accounts, user } =
    useAppSelector(state => state.auth);
  const langCode = useAppSelector(state => state.theme.langcode);

  const [alertVisible, setAlertVisible] = useState(false);
  const [backgroundDeniedModal, setBackgroundDeniedModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'success' | 'info',
  });

  const locationModalShownRef = useRef(false);
  const appState = useRef(AppState.currentState);

  // ------------------------- AppState Listener -------------------------
  useEffect(() => {
    const handleAppStateChange = async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        await checkLocation();
      }
      appState.current = nextAppState;
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [isAuthenticated]);

  // ------------------------- Language -------------------------
  useEffect(() => {
    changeLanguage(langCode);
  }, [langCode]);

  // ------------------------- Device Setup -------------------------
  useEffect(() => {
    const init = async () => {
      const name = await DeviceInfo.getDeviceName();
      await AsyncStorage.setItem('device', name);
      DevERPService.initialize();
      dispatch(checkAuthStateThunk());
    };
    init();
  }, [dispatch]);

  // ------------------------- Check Location -------------------------
  const checkLocation = async () => {
    if (!isAuthenticated) return;

    const enabled = await DeviceInfo.isLocationEnabled();
    const permission = await requestLocationPermissions();

    if (enabled && permission === 'granted') {
      // ✅ Permission granted, hide modals
      locationModalShownRef.current = false;
      setAlertVisible(false);
      setBackgroundDeniedModal(false);

      if (accounts.length && Platform.OS === 'android') {
        const data = accounts.map(u => ({
          token: u.user.token,
          link: u.user.companyLink.replace(/^https:\/\//i, 'http://'),
        }));
        NativeModules.LocationModule.setUserTokens(data);
        NativeModules.LocationModule.startService();
      }
      return;
    }

    if (permission === 'foreground-only') {
      setBackgroundDeniedModal(true);
      setAlertVisible(false);
      return;
    }

    // Denied or blocked
    if ((!enabled || permission === 'denied' || permission === 'blocked') && !locationModalShownRef.current) {
      setAlertConfig({
        title: 'Location Required',
        message:
          'Please enable location permission to continue using the app.',
        type: 'error',
      });
      setAlertVisible(true);
      setBackgroundDeniedModal(false);
      locationModalShownRef.current = true;
    }
  };

  // ------------------------- Focus -------------------------
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        checkLocation();
      }
    }, [isAuthenticated]),
  );

  // ------------------------- Render -------------------------
  if (isLoading) return <FullViewLoader />;

  return (
    <>
      {isAuthenticated ? <StackNavigator /> : <AuthNavigator />}

      {
        isAuthenticated && (
          <CustomAlert
            visible={alertVisible}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
            onClose={() => { }}
            isSettingVisible
            actionLoader={undefined}
          />
        )
      }


      {
        isAuthenticated && (
          <Modal visible={backgroundDeniedModal} transparent>
            <View style={styles.overlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.title}>Allow Background Location</Text>
                <Text style={styles.message}>
                  Set location access to "Always Allow" in settings for continuous tracking.
                </Text>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={() => Linking.openSettings()}>
                  <Text style={styles.btnText}>Open Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )
      }

    </>
  );
};

export default RootNavigator;

// ------------------------- Styles -------------------------
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    padding: 12,
    borderRadius: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
