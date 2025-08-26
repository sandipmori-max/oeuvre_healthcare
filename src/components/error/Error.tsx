import React from 'react';
import { Text, View, Image } from 'react-native';

import { ERP_ICON } from '../../assets';
import { styles } from './error_style';
import { ErrorMessageProps } from '../types';

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, visible = true }) => {
  if (!visible || !message) return null;
  return (
    <View style={styles.container}>
      <Image source={ERP_ICON.ERROR_ICON} style={styles.errorImage} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

export default ErrorMessage;
