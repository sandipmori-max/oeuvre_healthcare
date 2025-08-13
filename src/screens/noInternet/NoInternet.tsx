import React from 'react';
import {
  View,
  Text,
  TouchableOpacity, 
} from 'react-native';

import { styles } from './nointernet_style';
import useTranslations from '../../hooks/useTranslations';
import { ERP_GIF } from '../../assets';
import FastImage from 'react-native-fast-image';
import { NoInterNetProps } from './types';

const NoInternetScreen: React.FC<NoInterNetProps> = ({ onRetry }) => {
  const { t } = useTranslations();
  
  return (
    <View style={styles.container}>
       <FastImage
            source={ERP_GIF.NO_INTERNET}
             style={styles.gif}
             resizeMode="contain"
           />

      <Text style={styles.title}>{t('errors.noInternet')}</Text>
      <Text style={styles.subtitle}>
        {t('errors.somethingWentWrong')}
      </Text>

      <TouchableOpacity style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>{t('errors.tryAgain')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoInternetScreen;
