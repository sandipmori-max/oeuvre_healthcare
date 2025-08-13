// hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook to get real-time internet connection status
 * @returns {boolean} isConnected - whether the device is online
 */
const useNetworkStatus = (): boolean => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected ?? false);
  };

  useEffect(() => {
    checkConnection();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};

export default useNetworkStatus;
