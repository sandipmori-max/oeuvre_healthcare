import { useEffect, useState, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

type Coords = {
  latitude: number;
  longitude: number;
  accuracy?: number;
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

  // ---------- GET STABLE LOCATION ----------
  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setError('Location permission denied');
      setLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    setCoords({ latitude, longitude, accuracy });
    setAddress(`${latitude},${longitude}`);
    setLoading(false);
  },
  (err) => {

    // ⭐ fallback network
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });
        setAddress(`${latitude},${longitude}`);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  },
  {
    enableHighAccuracy: true,
    timeout: 25000,
    maximumAge: 0,
  }
);

  }, []);

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return {
    address,
    coords,
    loading,
    error,
    refetch: getLocation,
  };
};
