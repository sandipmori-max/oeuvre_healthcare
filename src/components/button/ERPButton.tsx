import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { ERPButtonProps } from './type';
import { styles } from './style';

const ERPButton: React.FC<ERPButtonProps> = ({
  text = '',
  onPress,
  color = '#007bff',
  disabled = false,
  style,
  textStyle,
  activeOpacity = 0.8,
}) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: color, opacity: disabled ? 0.6 : 1 }, style]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={activeOpacity}
  >
    <Text style={[styles.buttonText, textStyle]}>{text}</Text>
  </TouchableOpacity>
);

export default ERPButton;
