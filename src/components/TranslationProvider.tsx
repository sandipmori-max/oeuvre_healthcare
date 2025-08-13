import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
// Import the i18n instance directly
import '../i18n';

/**
 * Higher Order Component (HOC) that provides translation context to wrapped components
 * This ensures all components have access to translation functionality
 */
const withTranslation = (WrappedComponent: React.ComponentType<any>) => {
  const WithTranslation = (props: any) => {
    return (
      <I18nextProvider i18n={i18n}>
        <WrappedComponent {...props} />
      </I18nextProvider>
    );
  };

  // Set display name for debugging purposes
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithTranslation.displayName = `withTranslation(${displayName})`;

  return WithTranslation;
};

/**
 * Translation Provider component that can be used to wrap components
 * Useful when you want to provide translations to a specific component tree
 */
export const TranslationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default withTranslation;