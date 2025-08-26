import { ImageStyle } from 'react-native';

export const styles = {
  icon: (size: number, focused: boolean, color: string): ImageStyle => ({
    width: focused ? size + 14 : size,
    height: focused ? size + 14 : size,
    tintColor: color,
    resizeMode: 'contain',
  }),
};
