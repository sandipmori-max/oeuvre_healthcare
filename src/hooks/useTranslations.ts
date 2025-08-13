import { useTranslation } from 'react-i18next';
import { getCurrentLanguage, changeLanguage, getAvailableLanguages } from '../i18n';

/**
 * Custom hook for handling translations throughout the app
 * Provides easy access to translation functions and language management
 */
const useTranslations = () => {
  const { t, i18n } = useTranslation();

  return {
    /**
     * Translate a key
     * @param key - The translation key
     * @param options - Optional parameters for the translation
     */
    t,
    
    /**
     * Get the current language code
     */
    getCurrentLanguage: () => getCurrentLanguage(),
    
    /**
     * Change the app language
     * @param language - The language code to change to
     */
    changeLanguage: async (language: string) => {
      await changeLanguage(language);
    },
    
    /**
     * Get list of available languages
     */
    getAvailableLanguages: () => getAvailableLanguages(),
    
    /**
     * Get the display name of the current language
     */
    getCurrentLanguageDisplayName: () => {
      const currentCode = getCurrentLanguage();
      const languages = getAvailableLanguages();
      const language = languages.find(lang => lang.code === currentCode);
      return language ? language.name : 'English';
    },
  };
};

export default useTranslations;