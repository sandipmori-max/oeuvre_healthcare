import React from 'react';
import { View, Text } from 'react-native';
import { Formik } from 'formik';
import { getMessaging } from '@react-native-firebase/messaging';

import { erp_login_validation_schema } from '../../../../utils/validations/login_validations';
import { styles } from '../login_style';
import { useApi } from '../../../../hooks/useApi';
import { DevERPService } from '../../../../services/api';
import { LoginFormProps } from '../types';
import useTranslations from '../../../../hooks/useTranslations';
import ERPTextInput from '../../../../components/input/ERPTextInput';
import ERPButton from '../../../../components/button/ERPButton';
import useFcmToken from '../../../../hooks/useFcmToken';
import { generateGUID } from '../../../../utils/helpers';

const LoginForm: React.FC<LoginFormProps> = ({
  deviceId,
  isLoading,
  onLoginSuccess,
  showAlert,
}) => {
  const { t } = useTranslations();
  const { token: fcmToken } = useFcmToken();

  const {
    execute: validateCompanyCode,
    loading: validationLoading,
    error: validationError,
  } = useApi();

  const { execute: loginWithERP, loading: erpLoginLoading, error: erpLoginError } = useApi();

  const initialFormValues = {
    company_code: '',
    user: '',
    password: '',
    firebaseid: fcmToken,
    device: deviceId,
  };

  const handleLoginSubmit = async (values: typeof initialFormValues) => {
    try {
      const companyValidation = await validateCompanyCode(() =>
        DevERPService.validateCompanyCode(values.company_code),
      );
      if (!companyValidation?.isValid) {
        return;
      }
      const currentFcmToken = fcmToken || (await getMessaging().getToken());
      const appId = generateGUID();
      DevERPService.setAppId(generateGUID());
      DevERPService.setDevice(deviceId);

      const loginResult = await loginWithERP(() =>
        DevERPService.loginToERP({
          user: values.user,
          pass: values.password,
          appid: appId,
          firebaseid: currentFcmToken || '',
        }),
      );
      if (loginResult?.success === 1) {
        await DevERPService.getAuth();
        await onLoginSuccess(values.company_code, values.password, {
          user: values.user,
          name: values.user,
        });
      } else {
        showAlert({
          title: t('auth.error'),
          message: loginResult?.message || t('auth.loginFailed'),
          type: 'error',
        });
      }
    } catch (e) {}
  };

  return (
    <>
      {(validationError || erpLoginError) && (
        <View style={styles.errorContainer}>
          {!!validationError && <Text style={styles.errorText}>{validationError}</Text>}
          {!!erpLoginError && <Text style={styles.errorText}>{erpLoginError}</Text>}
        </View>
      )}

      <Formik
        initialValues={initialFormValues}
        validationSchema={erp_login_validation_schema}
        onSubmit={handleLoginSubmit}
      >
        {({ handleChange, handleBlur, values, errors, touched, handleSubmit }) => (
          <>
            <ERPTextInput
              label={t('auth.companyCode')}
              placeholder={t('auth.enterCompanyCode')}
              placeholderTextColor="#999"
              autoCapitalize="none"
              onChangeText={handleChange('company_code')}
              onBlur={handleBlur('company_code')}
              value={values.company_code}
              error={errors.company_code}
              touched={touched.company_code}
              containerStyle={styles.inputContainer}
              labelStyle={styles.inputLabel}
              inputStyle={styles.input}
              errorStyle={styles.errorText}
            />

            <ERPTextInput
              label={t('auth.user')}
              placeholder={t('auth.enterUser')}
              placeholderTextColor="#999"
              autoCapitalize="none"
              onChangeText={handleChange('user')}
              onBlur={handleBlur('user')}
              value={values.user}
              error={errors.user}
              touched={touched.user}
              containerStyle={styles.inputContainer}
              labelStyle={styles.inputLabel}
              inputStyle={styles.input}
              errorStyle={styles.errorText}
            />

            <ERPTextInput
              label={t('auth.password')}
              placeholder={t('auth.enterPassword')}
              placeholderTextColor="#999"
              secureTextEntry
              showToggle
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              error={errors.password}
              touched={touched.password}
              containerStyle={styles.inputContainer}
              labelStyle={styles.inputLabel}
              inputStyle={styles.input}
              errorStyle={styles.errorText}
            />

            <ERPButton
              text={
                isLoading || validationLoading || erpLoginLoading
                  ? t('auth.signingIn')
                  : t('auth.signIn')
              }
              onPress={handleSubmit as any}
              color={isLoading || validationLoading || erpLoginLoading ? '#aaa' : '#007bff'}
              disabled={isLoading || validationLoading || erpLoginLoading}
              style={styles.loginButton}
              textStyle={styles.loginButtonText}
            />
          </>
        )}
      </Formik>
    </>
  );
};

export default LoginForm;
