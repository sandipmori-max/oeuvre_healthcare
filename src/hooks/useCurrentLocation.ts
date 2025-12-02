import { useEffect, useState, useCallback } from 'react';
import Geolocation from '@react-native-community/geolocation';


export const useCurrentAddress = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("longitude ***********************-******---------------- ", latitude, longitude)

        setCoords({ latitude, longitude });
        setAddress(`${latitude.toString()},${longitude.toString()}`);
        setError(null)
        setLoading(false);

      },
      (err) => {
        console.log("longitude errrrrrrr***********************-******---------------- ", err)

        setError(err.message || 'Location error');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { address, coords, loading, error, refetch: fetchLocation };
};
