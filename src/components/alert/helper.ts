import { styles } from "./custom_alert_style";

export const getAlertStyles = (type: string) => {
  switch (type) {
    case 'error':
      return {
        container: styles.errorContainer,
        title: styles.errorTitle,
        message: styles.errorMessage,
      };
    case 'success':
      return {
        container: styles.successContainer,
        title: styles.successTitle,
        message: styles.successMessage,
      };
    default:
      return {
        container: styles.infoContainer,
        title: styles.infoTitle,
        message: styles.infoMessage,
      };
  }
};