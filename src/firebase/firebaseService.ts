import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

/**
 * Request permission for push notifications (iOS requires explicit).
 */
export async function requestUserPermission(): Promise<void> {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Push notification permission granted');
    await getFcmToken();
  } else {
    console.log('Push notification permission denied');
  }
}

/**
 * Get FCM token for the device.
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    if (token) {
      console.log('✅ FCM Token:', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Foreground notification listener.
 */
export function onMessageListener(
  callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
) {
  return messaging().onMessage(async remoteMessage => {
    console.log('📩 Foreground message:', remoteMessage);
    callback(remoteMessage);
  });
}

/**
 * Background notification handler.
 */
export function setBackgroundMessageHandler() {
  messaging().setBackgroundMessageHandler(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('📩 Background message:', remoteMessage);
      // You can trigger a local notification here if needed
    }
  );
}

/**
 * App opened from background (user taps on notification).
 */
export function onNotificationOpenedAppListener(
  callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
) {
  return messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage) {
      console.log('📩 Opened from background:', remoteMessage);
      callback(remoteMessage);
    }
  });
}

/**
 * App opened from killed/quit state (user taps on notification).
 */
export async function checkInitialNotification(
  callback: (message: FirebaseMessagingTypes.RemoteMessage) => void
) {
  const remoteMessage = await messaging().getInitialNotification();
  if (remoteMessage) {
    console.log('📩 Opened from quit state:', remoteMessage);
    callback(remoteMessage);
  }
}
