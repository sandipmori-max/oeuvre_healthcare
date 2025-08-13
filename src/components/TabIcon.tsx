import React from 'react';
import {Text} from 'react-native';

import { TabIconProps } from './types';
import { getBottomTabIcon } from '../utils/helpers';

const TabIcon: React.FC<TabIconProps> = ({name, color, size}) => {
  return (
    <Text style={{fontSize: size - 4, color}}>
      {getBottomTabIcon(name)}
    </Text>
  );
};

export default TabIcon;