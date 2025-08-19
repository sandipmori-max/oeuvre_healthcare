import React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import { ERP_ICON } from '../../assets';

interface ErrorMessageProps {
  message: string;
  visible?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, visible = true }) => {
  if (!visible || !message) return null;

  return (
    <View style={styles.container}>
      <Image source={ERP_ICON.ERROR_ICON} style={styles.errorImage} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  errorImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  errorText: {
    color: '#ec7f7fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ErrorMessage;
