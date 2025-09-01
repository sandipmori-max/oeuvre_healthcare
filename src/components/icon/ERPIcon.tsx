import { ActivityIndicator, TouchableOpacity } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { ERPIconProps } from './type';
import { baseStyle } from './icon_style';

const ERPIcon: React.FC<ERPIconProps> = ({
  name,
  isMenu = false,
  onPress,
  extStyle,
  extSize = 20,
  color = '#fff',
  isLoading = false,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[baseStyle(color, isMenu), extStyle]}>
      {isLoading ? (
        <ActivityIndicator color={'#fff'} size={'small'} />
      ) : (
        <MaterialIcons name={name} color={color} size={extSize} />
      )}
    </TouchableOpacity>
  );
};

export default ERPIcon;
