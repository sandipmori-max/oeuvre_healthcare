import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { loginUserThunk } from '../../../store/slices/auth/thunk';
import KeyboardAwareWrapper from '../../../components/KeyboardAwareWrapper';
import DeviceInfo from 'react-native-device-info';
import CustomAlert from '../../../components/alert/CustomAlert';
import useTranslations from '../../../hooks/useTranslations';
import { styles } from './login_style';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';

const LoginScreen = ({ navigation, route }: any) => {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.auth);

  const appId = DeviceInfo.getBundleId();
  const deviceId = DeviceInfo.getDeviceId();
  const isAddingAccount = route?.params?.isAddingAccount || false;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  const handlePersistAfterLogin = async (
    company_code: string,
    password: string,
    user_credentials: { user: string; name?: string }
  ) => {
    dispatch(loginUserThunk({ company_code, password, isAddingAccount, user_credentials }));
  };

  const showAlert = (config: { title: string; message: string; type: 'error' | 'success' | 'info' }) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <LoginHeader isAddingAccount={isAddingAccount} t={t} />
          <LoginForm
            appId={appId}
            deviceId={deviceId}
            isAddingAccount={isAddingAccount}
            isLoading={isLoading}
            onLoginSuccess={handlePersistAfterLogin}
            showAlert={showAlert}
          />
          {isAddingAccount && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>{t('auth.cancel')}</Text>
            </TouchableOpacity>
          )}
        </View>
        <KeyboardAwareWrapper />
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertVisible(false)}
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;