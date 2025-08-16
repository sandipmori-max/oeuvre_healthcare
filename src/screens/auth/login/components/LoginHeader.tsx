import React from 'react';
import { Image, Text } from 'react-native';
import { styles } from '../login_style';
import { ERP_ICON } from '../../../../assets';

const LoginHeader = ({ isAddingAccount, t }: { isAddingAccount: boolean; t: any }) => (
  <>
    <Image source={ERP_ICON.APP_LOGO} style={styles.logo} resizeMode="contain" />
    <Text style={styles.title}>
      {isAddingAccount ? t('auth.addAccount') : t('auth.welcomeDevERP')}
    </Text>
    <Text style={styles.subtitle}>
      {isAddingAccount ? t('auth.signInToAddAccount') : t('auth.signInToAccount')}
    </Text>
  </>
);

export default LoginHeader;
