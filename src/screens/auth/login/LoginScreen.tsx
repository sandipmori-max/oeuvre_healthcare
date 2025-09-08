import React, { useEffect, useState } from 'react';
import {
  View,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { loginUserThunk } from '../../../store/slices/auth/thunk';
import CustomAlert from '../../../components/alert/CustomAlert';
import useTranslations from '../../../hooks/useTranslations';
import { styles } from './login_style';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';

const LoginScreen = ({ navigation, route }: any) => {
  const { t } = useTranslations();

  const dispatch = useAppDispatch();

  const { isLoading } = useAppSelector(state => state.auth);

  const [deviceId, setDeviceId] = useState<string>('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  useEffect(() => {
    const fetchDeviceName = async () => {
      const name = await DeviceInfo.getDeviceName();
      console.log('Device Name:', name);
      setDeviceId(name);
    };

    fetchDeviceName();
  }, []);

  const isAddingAccount = route?.params?.isAddingAccount || false;

  const handlePersistAfterLogin = async (
    company_code: string,
    password: string,
    user_credentials: { user: string; name?: string },
    response: any,
  ) => {
    console.log('🚀 ~ handlePersistAfterLogin ~ response:---------', response);
    dispatch(
      loginUserThunk({ company_code, password, isAddingAccount, user_credentials, response }),
    );
  };

  const showAlert = (config: {
    title: string;
    message: string;
    type: 'error' | 'success' | 'info';
  }) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <FlatList
        data={['']}
        showsVerticalScrollIndicator={false}
        renderItem={() => {
          return (
            <>
              <View style={styles.formContainer}>
                <LoginHeader isAddingAccount={isAddingAccount} t={t} />
                <LoginForm
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

              <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertVisible(false)}
                actionLoader={undefined}
              />
            </>
          );
        }}
      />
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
