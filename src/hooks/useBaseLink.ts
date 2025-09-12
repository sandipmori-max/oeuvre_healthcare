import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useBaseLink = () => {
  const [baseLink, setBaseLink] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const loadBaseLink = async () => {
      try {
        const storedLink = await AsyncStorage.getItem('erp_link');
        if (!isMounted) return;

        let normalizedBase = (storedLink || '').replace(/\/+$/, '');
        normalizedBase = normalizedBase.replace(/\/devws\/?/, '/');
        normalizedBase = normalizedBase.replace(/^https:\/\//i, 'http://');

        setBaseLink(normalizedBase || '');
      } catch (e) {
        console.error('Error loading stored data:', e);
      }
    };

    loadBaseLink();

    return () => {
      isMounted = false;
    };
  }, []);

  return baseLink;
};
