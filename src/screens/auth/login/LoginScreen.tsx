import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView, 
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Formik } from 'formik';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { loginUserThunk } from '../../../store/slices/auth/thunk';
import { erp_login_validation_schema } from '../../../utils/validations/login_validations';
import { styles } from './login_style';
import KeyboardAwareWrapper from '../../../components/KeyboardAwareWrapper';
import { ERP_ICON } from '../../../assets';
import { DevERPService } from '../../../services/api';
import { useApi } from '../../../hooks/useApi';
import DeviceInfo from 'react-native-device-info';
import CustomAlert from '../../../components/alert/CustomAlert';
import useTranslations from '../../../hooks/useTranslations';

const LoginScreen = ({ navigation, route }: any) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.auth);
  const isAddingAccount = route?.params?.isAddingAccount || false;
  const { t } = useTranslations();

  // Single-step form; no separate company verification step UI

  const { execute: validateCompanyCode, loading: validationLoading, error: validationError } = useApi();
  const { execute: loginWithERP, loading: erpLoginLoading, error: erpLoginError } = useApi();
  const appId = DeviceInfo.getBundleId();
  const deviceId = DeviceInfo.getDeviceId();
  const handlePersistAfterLogin = async (company_code: string, password: string, user_credentials: { user: string; name?: string }) => {
    // Persist into Redux/SQLite using existing thunk
    // The thunk will handle database operations and token storage
    dispatch(loginUserThunk({ company_code, password, isAddingAccount, user_credentials }));
  };
  const [alertVisible, setAlertVisible] = useState(false);
  
 const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });
  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
       <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Image
             source={ERP_ICON.APP_LOGO}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>
              {isAddingAccount ? t('auth.addAccount') : t('auth.welcomeDevERP')}
            </Text>
            <Text style={styles.subtitle}>
              {isAddingAccount
                ? t('auth.signInToAddAccount')
                : t('auth.signInToAccount')}
            </Text>

            {/* Show API error if any */}
            {(validationError || erpLoginError) && (
              <View style={styles.errorContainer}>
                {!!validationError && <Text style={styles.errorText}>{validationError}</Text>}
                {!!erpLoginError && <Text style={styles.errorText}>{erpLoginError}</Text>}
              </View>
            )}

            <Formik
              initialValues={{
                company_code: '',
                user: '',
                password: '',
                appid: appId,
                firebaseid: '',
                device: deviceId,
              }}
              validationSchema={erp_login_validation_schema}
              onSubmit={async (values) => {
                try {
                  const companyValidation = await validateCompanyCode(() =>
                    DevERPService.validateCompanyCode(values.company_code)
                  );
                  if (!companyValidation?.isValid) {
                    setAlertConfig({
                      title: t('auth.error'),
                      message: companyValidation?.message || t('auth.invalidCompanyCode'),
                      type: 'error',
                    });
                    setAlertVisible(true);
                    return;
                  }

                  const loginResult = await loginWithERP(() =>
                    DevERPService.loginToERP({
                      user: values.user,
                      pass: values.password,
                      appid: values.appid,
                      firebaseid: values.firebaseid,
                    })
                  );

                  if (loginResult?.success === 1) {
                    await DevERPService.getAuth();
                    await handlePersistAfterLogin(values.company_code, values.password, {
                      user: values.user,
                      name: values.user,
                    });
                  } else {
                    setAlertConfig({
                      title: t('auth.error'),
                      message: loginResult?.message || t('auth.loginFailed'),
                      type: 'error',
                    });
                    setAlertVisible(true);
                  }
                } catch (e) {}
              }}
            >
              {({
                handleChange,
                handleBlur,
                values,
                errors,
                touched,
                setFieldValue,
                handleSubmit,
              }) => (
                <>
                  {/* Company Code */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t('auth.companyCode')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.enterCompanyCode')}
                      placeholderTextColor="#999"
                      autoCapitalize="none"
                      onChangeText={handleChange('company_code')}
                      onBlur={handleBlur('company_code')}
                      value={values?.company_code}
                    />
                    {touched.company_code && !!errors.company_code && (
                      <Text style={styles.errorText}>{errors.company_code}</Text>
                    )}
                  </View>

                  {/* User */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t('auth.user')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.enterUser')}
                      placeholderTextColor="#999"
                      autoCapitalize="none"
                      onChangeText={handleChange('user')}
                      onBlur={handleBlur('user')}
                      value={values?.user}
                    />
                    {touched.user && !!errors.user && (
                      <Text style={styles.errorText}>{errors.user}</Text>
                    )}
                  </View>

                  {/* Password */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{t('auth.password')}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.enterPassword')}
                      placeholderTextColor="#999"
                      secureTextEntry
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values?.password}
                    />
                    {touched.password && !!errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      (isLoading || validationLoading || erpLoginLoading) && styles.disabledButton,
                    ]}
                    onPress={handleSubmit as any}
                    disabled={isLoading || validationLoading || erpLoginLoading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.loginButtonText}>
                      {isLoading || validationLoading || erpLoginLoading ? t('auth.signingIn') : t('auth.signIn')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              
            </Formik>

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
