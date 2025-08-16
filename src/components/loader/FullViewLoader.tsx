import { View } from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';

import { ERP_GIF } from '../../assets';
import { styles } from './loader_style';

const FullViewLoader = () => {
  return (
    <View style={styles.loadingContainer}>
      <FastImage source={ERP_GIF.LOADING} style={styles.gif} resizeMode="contain" />
    </View>
  );
};

export default FullViewLoader;
