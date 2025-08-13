import { ERP_GIF } from "../../assets";

export const getBottomTabIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return '🏠';
      case 'profile':
        return '👤';
      case 'report':
        return '📋';
      case 'entry':
        return '📝';
      default:
        return '📱';
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