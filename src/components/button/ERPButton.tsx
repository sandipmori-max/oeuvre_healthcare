import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { ERPButtonProps } from './type';
import { styles } from './style';
import { ERP_COLOR_CODE } from '../../utils/constants';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const ERPButton: React.FC<ERPButtonProps> = ({
  text = '',
  onPress,
  color = ERP_COLOR_CODE.ERP_COLOR,
  disabled = false,
  style,
  textStyle,
  activeOpacity = 0.8,
  isLoading
}) => (
  <TouchableOpacity
    style={[styles.button, {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: color, opacity: disabled ? 0.6 : 1
    }, style]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={activeOpacity}
  >
    {
      isLoading && <ActivityIndicator size={'large'} color={'#fff'} />
    }
    <MaterialIcons name={'lock-outline'} color={'white'} size={20} />
    <Text style={[styles.buttonText, textStyle]}>{text}</Text>
  </TouchableOpacity>
);

export default ERPButton;
