import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DisplayScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Display</Text>
      <Text style={styles.text}>This is the Display page.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
  },
});

export default DisplayScreen;
