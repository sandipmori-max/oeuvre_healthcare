import { TouchableOpacity } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

const ERPIcon = ({ name, isMenu, onPress, extStyle, extSize = 20 }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        extStyle,
        {
          height: 32,
          width: 32,
          borderWidth: isMenu ? 0 : 1,
          borderColor: 'white',
          justifyContent:'center',
          alignContent:'center',
          alignItems:'center',
          marginHorizontal: 8,
          borderRadius: 4
        },
      ]}
    >
      <MaterialIcons name={name} color="#fff" size={extSize} />
    </TouchableOpacity>
  );
};

export default ERPIcon;
