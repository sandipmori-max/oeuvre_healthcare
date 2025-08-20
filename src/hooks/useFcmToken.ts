import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';

const useFcmToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  useEffect(() => {
    const initializeFCM = async () => {
      const permission = await requestUserPermission();
      setPermissionGranted(permission);

      if (permission) {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          setToken(fcmToken);
          // Optionally send it to your server here
        }
      }
    };

    initializeFCM();

    const unsubscribe = messaging().onTokenRefresh(newToken => {
      console.log('FCM Token refreshed:', newToken);
      setToken(newToken);
      // Optionally update your server here
    });

    return unsubscribe;
  }, []);

  const requestUserPermission = async (): Promise<boolean> => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted.');
    } else {
      console.log('Notification permission denied.');
    }

    return enabled;
  };

  return { token, permissionGranted };
};

export default useFcmToken;
