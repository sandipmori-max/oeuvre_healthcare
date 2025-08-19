import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Formik } from 'formik';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { loginUserThunk } from '../../../store/slices/auth/thunk';

import { styles } from './add_account_style';
import { erp_add_account_validation_schema } from '../../../utils/validations/add_accounts';
import { AddAccountScreenProps } from './type';
import { ERP_ICON } from '../../../assets';
import { DevERPService } from '../../../services/api';
import { useApi } from '../../../hooks/useApi';
import DeviceInfo from 'react-native-device-info';
import CustomAlert from '../../../components/alert/CustomAlert';

const AddAccountScreen: React.FC<AddAccountScreenProps> = ({ visible, onClose }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state?.auth);
  const { execute: validateCompanyCode, execute: loginWithERP } = useApi();
  const { accounts, activeAccountId } = useAppSelector(state => state.auth);

  const appId = DeviceInfo.getBundleId();
  const deviceId = DeviceInfo.getDeviceId();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  const handleClose = () => {
    onClose();
  };

  const handleAddAccount = async (values: {
    company_code: string;
    user: string;
    password: string;
  }) => {
    try {
      const userExists = accounts?.some(acc => acc?.user.name === values.user);
      if (userExists) {
        setAlertConfig({
          title: 'Error',
          message: 'This user already exists in your accounts.',
          type: 'error',
        });
        setAlertVisible(true);
        return;
      }
      const validation = await validateCompanyCode(() =>
        DevERPService.validateCompanyCode(values.company_code),
      );
      if (!validation?.isValid) {
        return;
      }

      const loginResult = await loginWithERP(() =>
        DevERPService.loginToERP({
          user: values.user,
          pass: values.password,
          appid: appId,
          firebaseid: '',
        }),
      );

      if (!loginResult || loginResult?.success !== 1) {
        setAlertConfig({
          title: 'Login failed',
          message: loginResult?.message || 'Unable to login',
          type: 'error',
        });
        setAlertVisible(true);
        return;
      }

      await DevERPService.getAuth(true);
      dispatch(
        loginUserThunk({
          newToken: loginResult?.token,
          newvalidTill: loginResult?.validTill,
          company_code: values.company_code,
          password: values.password,
          isAddingAccount: true,
          user_credentials: { user: values.user, name: values.user },
        }),
      );
      setAlertConfig({ title: 'Success', message: 'Account added successfully', type: 'success' });
      setAlertVisible(true);
      onClose();
    } catch (e: any) {
      setAlertConfig({
        title: 'Error',
        message: e?.message || 'Something went wrong',
        type: 'error',
      });
      setAlertVisible(true);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Image source={ERP_ICON.BACK} style={styles.back} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Account</Text>
        </View>

        <View style={styles.formContainer}>
          <Image source={ERP_ICON.APP_LOGO} style={styles.logo} resizeMode="contain" />

          <Text style={styles.subtitle}>Sign in to add another account</Text>

          <Formik
            initialValues={{ company_code: '', user: '', password: '' }}
            validationSchema={erp_add_account_validation_schema}
            onSubmit={handleAddAccount}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Company Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your company code"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    onChangeText={handleChange('company_code')}
                    onBlur={handleBlur('company_code')}
                    value={values?.company_code}
                  />
                  {touched?.company_code && errors?.company_code && (
                    <Text style={styles.errorText}>{errors?.company_code}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>User</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter user"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    onChangeText={handleChange('user')}
                    onBlur={handleBlur('user')}
                    value={values?.user}
                  />
                  {touched?.user && errors?.user && (
                    <Text style={styles.errorText}>{errors?.user}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    placeholderTextColor="#999"
                    value={values?.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                  />
                  {touched?.password && errors?.password && (
                    <Text style={styles.errorText}>{errors?.password}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.addButton, isLoading && styles.disabledButton]}
                  onPress={() => handleSubmit()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.addButtonText}>Add Account</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Formik>

          <Text style={styles.note}>
            This account will be added to your list. You can switch between accounts anytime.
          </Text>
        </View>
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertVisible(false)}
        />
      </View>
    </Modal>
  );
};

export default AddAccountScreen;
