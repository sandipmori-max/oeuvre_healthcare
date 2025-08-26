import React from 'react';
import { Image } from 'react-native';
import { TabIconProps } from './type';
import { useAppSelector } from '../../store/hooks';
import { getBottomTabIcon } from '../../utils/helpers';
import { styles } from './tab_style';

const TabIcon: React.FC<TabIconProps & { focused: boolean }> = ({ name, color, size, focused }) => {
  const theme = useAppSelector(state => state.theme);

  const iconSource = getBottomTabIcon(name, focused, theme);

  return <Image source={iconSource} style={styles.icon(size, focused, color)} />;
};

export default TabIcon;
