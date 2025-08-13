import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './display_style';

const DisplayScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Display</Text>
      <Text style={styles.text}>This is the Display page.</Text>
    </View>
  );
};

export default DisplayScreen;
