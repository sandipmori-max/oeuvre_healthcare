import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type BoolInputProps = {
  value: any;
  onChange: (val: boolean) => void;
  label?: string;
};

const BoolInput = ({ value, onChange, label }: BoolInputProps) => {
  return (
    <View style={{  marginBottom: 10 }}>
      {label && <Text style={{ marginBottom: 4, fontWeight: '600' }}>{label}</Text>}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          style={[styles.radio, value && styles.radioSelected]}
          onPress={() => onChange(true)}
        >
          {value && <View style={styles.radioInner} />}
        </TouchableOpacity>
        <Text style={{ marginRight: 16 }}>True</Text>

        <TouchableOpacity
          style={[styles.radio, !value && styles.radioSelected]}
          onPress={() => onChange(false)}
        >
          {!value && <View style={styles.radioInner} />}
        </TouchableOpacity>
        <Text>False</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  radioSelected: {
    borderColor: '#007bff',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007bff',
  },
});

export default BoolInput;
