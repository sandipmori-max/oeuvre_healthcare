import { View } from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';

import { ERP_GIF } from '../../assets';
import { styles } from './loader_style';
import { useAppSelector } from '../../store/hooks';

const FullViewLoader = () => {
    const theme = useAppSelector(state => state?.theme.mode);
  
  return (
    <View style={[styles.loadingContainer, 
    theme === 'dark' && {
      backgroundColor: 'black',
      flex: 1,
      
    }]}>
      <FastImage source={ERP_GIF.LOADING} style={styles.gif} resizeMode="contain" />
    </View>
  );
};

export default FullViewLoader;
