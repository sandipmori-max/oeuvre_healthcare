import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './alert_style';

const AlertScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alert</Text>
      <Text style={styles.text}>This is the Alert page.</Text>
    </View>
  );
};

export default AlertScreen;
