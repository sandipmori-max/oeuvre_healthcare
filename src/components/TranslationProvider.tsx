import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

import '../i18n';

const withTranslation = (WrappedComponent: React.ComponentType<any>) => {
  const WithTranslation = (props: any) => {
    return (
      <I18nextProvider i18n={i18n}>
        <WrappedComponent {...props} />
      </I18nextProvider>
    );
  };

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithTranslation.displayName = `withTranslation(${displayName})`;

  return WithTranslation;
};

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default withTranslation;
