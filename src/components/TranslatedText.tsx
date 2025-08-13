import React from 'react';
import { Text, TextProps } from 'react-native';
import useTranslations from '../hooks/useTranslations';

interface TranslatedTextProps extends TextProps {
  translationKey: string;
  options?: Record<string, any>;
}

/**
 * A reusable component that automatically translates text using i18n
 * 
 * Usage example:
 * <TranslatedText translationKey="common.save" style={styles.buttonText} />
 */
const TranslatedText: React.FC<TranslatedTextProps> = ({
  translationKey,
  options,
  ...textProps
}) => {
  const { t } = useTranslations();

  return (
    <Text {...textProps}>
      {t(translationKey, options)}
    </Text>
  );
};

export default TranslatedText;