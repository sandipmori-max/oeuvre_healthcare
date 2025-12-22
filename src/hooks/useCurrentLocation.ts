import { useEffect, useState, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

type Coords = {
  latitude: number;
  longitude: number;
};

export const useCurrentAddress = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- ANDROID PERMISSION ----------
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location',
          buttonPositive: 'OK',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  };

  // ---------- GET LOCATION ----------
  const getLocation = useCallback(
    async (highAccuracy = false) => {
      setLoading(true);
      setError(null);

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          setCoords({ latitude, longitude });
          setAddress(`${latitude},${longitude}`);
          setLoading(false);
        },
        (err) => {
          // If first attempt fails, retry with high accuracy
          if (!highAccuracy) {
            getLocation(true);
            return;
          }

          setError(err.message || 'Unable to fetch location');
          setLoading(false);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 25000 : 15000,
          maximumAge: 30000,
        }
      );
    },
    []
  );

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return {
    address,
    coords,
    loading,
    error,
    refetch: () => getLocation(),
  };
};
