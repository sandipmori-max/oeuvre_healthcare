import React from 'react';
import { Image } from 'react-native';
import { TabIconProps } from './types';
import { getBottomTabIcon } from '../utils/helpers';

const TabIcon: React.FC<TabIconProps & { focused: boolean }> = ({ name, color, size, focused }) => {
  const iconSource = getBottomTabIcon(name, focused);
  return (
    <Image
      source={iconSource}
      style={{
        width: focused ? size + 14 : size,
        height: focused ? size + 14 : size,
        tintColor: color,
        resizeMode: 'contain',
      }}
    />
  );
};

export default TabIcon;