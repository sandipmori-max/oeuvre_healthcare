import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from './translations/en';
import hi from './translations/hi';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Get stored language from AsyncStorage
      const storedLanguage = await AsyncStorage.getItem('user-language');
      if (storedLanguage) {
        // Return detected language
        callback(storedLanguage);
        return;
      }
    } catch (error) {
      console.log('Error reading language from AsyncStorage:', error);
    }
    // If no language is stored, use device language or default to 'en'
    callback(I18nManager.isRTL ? 'ar' : 'en');
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      // Save selected language to AsyncStorage
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.log('Error saving language to AsyncStorage:', error);
    }
  },
};

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Helper functions for language management
export const changeLanguage = async (language: string) => {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem('user-language', language);
};

export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    // Add more languages as needed
  ];
};