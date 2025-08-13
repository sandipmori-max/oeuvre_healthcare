import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ERPButtonProps {
  text: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeOpacity?: number;
}

const ERPButton: React.FC<ERPButtonProps> = ({
  text,
  onPress,
  color = '#007bff',
  disabled = false,
  style,
  textStyle,
  activeOpacity = 0.8,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      { backgroundColor: color, opacity: disabled ? 0.6 : 1 },
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={activeOpacity}
  >
    <Text style={[styles.buttonText, textStyle]}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ERPButton;