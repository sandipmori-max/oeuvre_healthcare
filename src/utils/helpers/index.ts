import { Platform } from "react-native";
import { ERP_GIF, ERP_ICON } from "../../assets";
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';


export const getBottomTabIcon = (iconName: string, focused: boolean) => {
  switch (iconName) {
    case 'home':
      return focused ? ERP_ICON.ACTIVE_HOME : ERP_ICON.HOME;
    case 'profile':
      return focused ? ERP_ICON.ACTIVE_PROFILE : ERP_ICON.PROFILE;
    case 'report':
      return focused ? ERP_ICON.ACTIVE_REPORT : ERP_ICON.REPORT;
    case 'entry':
      return focused ? ERP_ICON.ACTIVE_ENTRY : ERP_ICON.ENTRY;
    case 'auth':
      return focused ? ERP_ICON.ACTIVE_AUTH : ERP_ICON.AUTH;
    default:
      return ERP_ICON.HOME;
  }
};

export const formatDateMonthDateYear = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
};

export function formatHeaderTitle(key: string): string {
  let result = key.replace(/[_\.\-]+/g, ' ');
  result = result.replace(/([a-z])([A-Z])/g, '$1 $2');
  result = result.replace(/([a-zA-Z])([0-9]+)/g, '$1 $2');
  result = result.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  return result.trim();
};

export const firstLetterUpperCase = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getGifSource = (type: 'error' | 'success' | 'info') => {
  switch (type) {
    case 'error':
      return ERP_GIF.ERROR;
    case 'success':
      return ERP_GIF.SUCCESS; 
    default:
      return ERP_GIF.SEARCH_LOADER;
  }
};

export const requestCameraAndLocationPermission = async (): Promise<boolean> => {
    try {
      const cameraPerm = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
      const locationPerm = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const cameraStatus = await check(cameraPerm);
      const locationStatus = await check(locationPerm);

      const cameraGranted = cameraStatus === RESULTS.GRANTED
        ? true
        : (await request(cameraPerm)) === RESULTS.GRANTED;

      const locationGranted = locationStatus === RESULTS.GRANTED
        ? true
        : (await request(locationPerm)) === RESULTS.GRANTED;

      return cameraGranted && locationGranted;
    } catch (error) {
      console.warn('Permission error:', error);
      return false;
    }
  };