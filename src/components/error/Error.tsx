import React from 'react';
import { Text, View, Image } from 'react-native';

import { ERP_ICON } from '../../assets';
import { styles } from './error_style';
import { ErrorMessageProps } from '../types';
import { useAppSelector } from '../../store/hooks';

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, visible = true }) => {
  if (!visible || !message) return null;
  const theme = useAppSelector(state => state?.theme.mode);

  return (
    <View style={[styles.container, theme === 'dark' && {
      backgroundColor: 'black'
    }]}>
      <Image source={ERP_ICON.ERROR_ICON} style={styles.errorImage} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

export default ErrorMessage;
