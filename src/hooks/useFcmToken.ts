import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

 useEffect(() => {
  const initializeFCM = async () => {
    try {
      const permission = await requestUserPermission();
      console.log("Permission Granted:", permission);
      setPermissionGranted(permission);

      if (permission) {
        const fcmToken = await messaging().getToken();
        console.log("FCM Token fetched:", fcmToken);
        if (fcmToken) {
          setToken(fcmToken);
        }
      }
    } catch (err) {
      console.error("FCM Initialization error:", err);
    }
  };

  initializeFCM();

  const unsubscribe = messaging().onTokenRefresh(newToken => {
    console.log("Token refreshed:", newToken);
    setToken(newToken);
  });

  return unsubscribe;
}, []);


const requestUserPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('Permission status:', authStatus);
    return enabled;
  }

  // Android - Always return true
  return true;
};

  return { token, permissionGranted };
};

export default useFcmToken;
