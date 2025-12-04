import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image, FlatList } from 'react-native';
import { Formik } from 'formik';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { loginUserThunk } from '../../../store/slices/auth/thunk';

import { styles } from './add_account_style';
import { erp_add_account_validation_schema } from '../../../utils/validations/add_accounts';
import { AddAccountScreenProps } from './type';
import { ERP_ICON } from '../../../assets';
import { DevERPService } from '../../../services/api';
import { useApi } from '../../../hooks/useApi';
import CustomAlert from '../../../components/alert/CustomAlert';
import { getMessaging } from '@react-native-firebase/messaging';
import useFcmToken from '../../../hooks/useFcmToken';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTranslation } from 'react-i18next';
import { ERP_COLOR_CODE } from '../../../utils/constants';

const AddAccountScreen: React.FC<AddAccountScreenProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state?.theme.mode);

  const { execute: validateCompanyCode, execute: loginWithERP } = useApi();

  const { accounts, user } = useAppSelector(state => state.auth);

  const { token: fcmToken } = useFcmToken();
  const [isInputEditCC, setIsInputEditCC] = useState(false);
  const [isInputEditUSer, setIsInputEditUser] = useState(false);
  const [isInputEditPass, setIsInputEditPass] = useState(false);

  const [deviceId, setDeviceId] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [loader, setLoader] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  useEffect(() => {
    setLoader(false);
  }, [visible]);

  useEffect(() => {
    const fetchDeviceName = async () => {
      const name = await DeviceInfo.getDeviceName();
      setDeviceId(name);
      AsyncStorage.setItem('device', name);
    };

    fetchDeviceName();
  }, []);

  const handleClose = () => {
    setLoader(false);
    setAlertVisible(false);
    setAlertVisible(false);
    onClose();
  };

  const handleAddAccount = async (values: {
    company_code: string;
    user: string;
    password: string;
  }) => {
    try {
      DevERPService.setDevice(deviceId);
      setLoader(true);
      const userExists = accounts?.some(acc => acc?.user?.name === values?.user);
      const codeExists = accounts?.some(acc => acc?.user?.company_code === 'oeuvre01');

      if (userExists && codeExists) {
        setAlertConfig({
          title: t("title.title1"),
          message: t("msg.msg"),
          type: 'error',
        });
        setAlertVisible(true);
        return;
      }
      const validation = await validateCompanyCode(() =>
        DevERPService.validateCompanyCode('oeuvre01'),
      );
      if (!validation?.isValid) {
        setLoader(false);
        return;
      }
      const currentFcmToken = fcmToken || (await getMessaging().getToken());

      const loginResult = await loginWithERP(() =>
        DevERPService.loginToERP({
          user: values?.user,
          pass: values?.password,
          firebaseid: currentFcmToken,
        }),
      );
      if (loginResult?.success === '0' || loginResult?.success === 0) {
        const validation = await validateCompanyCode(() =>
          DevERPService.validateCompanyCode('oeuvre01'),
        );
        if (!validation?.isValid) {
          setLoader(false);
          return;
        }
        setAlertConfig({
          title: t("title.title2"),
          message: loginResult?.message || t("msg.msg2"),
          type: 'error',
        });
        setAlertVisible(true);
        return;
      }

      if (loginResult?.success !== 1) {
        setAlertConfig({
          title: t("title.title1"),
          message: loginResult?.message || t("msg.msg2"),
          type: 'error',
        });
        setAlertVisible(true);
        return;
      }

      DevERPService.setToken(loginResult?.token);
      await AsyncStorage.setItem('erp_token', loginResult?.token || '');
      await AsyncStorage.setItem('auth_token', loginResult?.token || '');
      await AsyncStorage.setItem('erp_token_valid_till', loginResult?.tokenValidTill || '');

      dispatch(
        loginUserThunk({
          newToken: loginResult?.token,
          newvalidTill: loginResult?.validtill,
          company_code: 'oeuvre01',
          password: values?.password,
          isAddingAccount: true,
          user_credentials: { user: values?.user, name: values?.user },
          response: loginResult,
          companyData: validation,
        }),
      );
      setAlertConfig({ title: t("title.title3"), message: t("msg.msg3"), type: 'success' });
      setAlertVisible(true);
      onClose();
      setLoader(false);
    } catch (e: any) {
      console.log("e -------------------- ", e)
      setAlertConfig({
        title: t("title.title1"),
        message: e?.message || t("msg.msg4"),
        type: 'error',
      });
      setAlertVisible(true);
      setLoader(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, theme === 'dark' && {
        backgroundColor: 'black'
      }]}>
        <View style={[styles.header, theme === 'dark' && {
          backgroundColor: 'black'
        }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Image source={ERP_ICON.BACK} style={styles.back} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('account.addAccount')}</Text>
        </View>
        <FlatList
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          keyboardShouldPersistTaps="handled"
          data={['']}
          renderItem={() => {
            return (
              <>
                <View style={styles.formContainer}>
                  <Image source={ERP_ICON.APP_LOGO} style={styles.logo} resizeMode="contain" />
                  <Text style={[styles.subtitle, theme === 'dark' && {
                    color: 'white'
                  }]}>{t('account.msg')}</Text>
                  <Formik
                    initialValues={{ company_code: 'oeuvre01', user: '', password: '' }}
                    validationSchema={erp_add_account_validation_schema}
                    onSubmit={handleAddAccount}
                  >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                      <>
                        {/* <View style={styles.inputContainer}>
                          <Text style={[styles.inputLabel, theme === 'dark' && {
                            color: 'white'
                          }]}>{t('account.companyCode')}</Text>
                          <View
                            style={[
                              styles.inputContainer,
                              {
                                justifyContent: 'center',
                                alignContent: 'center',
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                                paddingLeft: 12,
                              },
                              touched?.company_code && errors?.company_code &&
                              {
                                borderColor: ERP_COLOR_CODE.ERP_ERROR,
                                borderWidth: 0.8,
                              },
                              isInputEditCC && {
                                borderColor: '#81b5e4',
                                borderWidth: 0.8,
                              },
                              values?.company_code && {
                                borderColor: 'green',
                                borderWidth: 0.8,
                              },
                              theme === 'dark' && {
                                backgroundColor: 'black'
                              }
                            ]}
                          >
                            <MaterialIcons name="closed-caption-off" size={20} color={ERP_COLOR_CODE.ERP_999} />

                            <TextInput
                              style={[styles.input,
                              theme === 'dark' && {
                                backgroundColor: 'black'
                              }
                              ]}
                              placeholder={t('auth.enterCompanyCode')}
                              placeholderTextColor={ERP_COLOR_CODE.ERP_999}
                              autoCapitalize="none"
                              onChangeText={handleChange('company_code')}
                              value={values?.company_code}
                              onFocus={e => {
                                setIsInputEditCC(true);
                              }}
                              onBlur={() => {
                                if (!values?.company_code) {
                                  handleBlur('company_code')
                                  setIsInputEditCC(false);

                                }
                              }}
                            />
                          </View>

                          {touched?.company_code && errors?.company_code && (
                            <Text style={styles.errorText}>{errors?.company_code}</Text>
                          )}
                        </View> */}

                        <View style={styles.inputContainer}>
                          <Text style={[styles.inputLabel, theme === 'dark' && {
                            color: 'white'
                          }]}>{t('auth.user')}</Text>
                          <View
                            style={[
                              styles.inputContainer,
                              {
                                justifyContent: 'center',
                                alignContent: 'center',
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                                paddingLeft: 12,
                              },
                              touched?.user && errors?.user && {
                                borderColor: ERP_COLOR_CODE.ERP_ERROR,
                                borderWidth: 0.8,
                              },
                              isInputEditUSer && {
                                borderColor: '#81b5e4',
                                borderWidth: 0.8,
                              },
                              values?.user && {
                                borderColor: 'green',
                                borderWidth: 0.8,
                              },

                            ]}
                          >
                            <MaterialIcons name="person" size={20} color={ERP_COLOR_CODE.ERP_999} />
                            <TextInput
                              style={[styles.input, theme === 'dark' && {
                                backgroundColor: 'black'
                              }]}
                              placeholder={t('auth.enterUser')}
                              placeholderTextColor={ERP_COLOR_CODE.ERP_999}
                              autoCapitalize="none"
                              onChangeText={handleChange('user')}
                              value={values?.user}
                              onFocus={e => {
                                setIsInputEditUser(true);
                              }}
                              onBlur={() => {
                                if (!values?.company_code) {
                                  handleBlur('user')
                                  setIsInputEditUser(false);

                                }
                              }}
                            />
                          </View>
                          {touched?.user && errors?.user && (
                            <Text style={styles.errorText}>{errors?.user}</Text>
                          )}
                        </View>

                        <View style={styles.inputContainer}>
                          <Text style={[styles.inputLabel, theme === 'dark' && {
                            color: 'white'
                          }]}>{t('auth.password')}</Text>

                          <View
                            style={[
                              styles.inputContainer,
                              {
                                justifyContent: 'center',
                                alignContent: 'center',
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
                                paddingLeft: 12,
                              },
                              touched?.password && errors?.password && {
                                borderColor: ERP_COLOR_CODE.ERP_ERROR,
                                borderWidth: 0.8,
                              },
                              isInputEditPass && {
                                borderColor: '#81b5e4',
                                borderWidth: 0.8,
                              },
                              values?.password && {
                                borderColor: 'green',
                                borderWidth: 0.8,
                              },
                            ]}
                          >
                            <MaterialIcons name="password" size={20} color={ERP_COLOR_CODE.ERP_999} />

                            <TextInput
                              style={[styles.input1, theme === 'dark' && {
                                backgroundColor: 'black'
                              }]}
                              placeholder={t('auth.enterPassword')}
                              secureTextEntry={!showPassword}
                              placeholderTextColor={ERP_COLOR_CODE.ERP_999}
                              value={values?.password}
                              onChangeText={handleChange('password')}
                              onFocus={e => {
                                setIsInputEditPass(true);
                              }}
                              onBlur={() => {
                                if (!values?.company_code) {
                                  handleBlur('password')
                                  setIsInputEditPass(false);
                                }
                              }}

                            />
                            <TouchableOpacity
                              onPress={() => setShowPassword(s => !s)}
                              style={styles.toggleButton}
                              accessibilityLabel={!showPassword ? t("text.text1") : t("text.text2")}
                            >
                              <MaterialIcons
                                name={!showPassword ? 'visibility-off' : 'visibility'}
                                color={ERP_COLOR_CODE.ERP_999}
                                size={20}
                              />
                            </TouchableOpacity>
                          </View>
                          {touched?.password && errors?.password && (
                            <Text style={styles.errorText}>{errors?.password}</Text>
                          )}
                        </View>

                        <TouchableOpacity
                          style={[styles.addButton, loader && styles.disabledButton, theme === 'dark' && {
                            backgroundColor: 'black',
                            borderColor: 'white',
                            borderWidth: 1
                          }]}
                          onPress={() => {
                            handleSubmit();
                          }}
                          disabled={loader}
                        >
                          <MaterialIcons
                            name="person-add-alt"
                            size={24}
                            color={theme === 'dark' ? 'white' : ERP_COLOR_CODE.ERP_WHITE}
                          />

                          {loader ? (
                            <Text style={styles.addButtonText}>{t('account.adding')}</Text>
                          ) : (
                            <Text style={styles.addButtonText}>{t('account.add')}</Text>
                          )}
                        </TouchableOpacity>
                      </>
                    )}
                  </Formik>

                  <Text style={styles.note}>{t('account.msg1')}</Text>
                </View>
              </>
            );
          }}
        />

        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={async () => {
            setLoader(false);
            setAlertVisible(false);
            setAlertVisible(false);
            DevERPService.setAppId(user?.app_id);
            DevERPService.setToken(user?.token);
            await AsyncStorage.setItem('erp_token', user?.token || '');
            await AsyncStorage.setItem('auth_token', user?.token || '');
            await AsyncStorage.setItem('erp_token_valid_till', user?.tokenValidTill || '');
          }}
          actionLoader={undefined}
        />
      </View>
    </Modal>
  );
};

export default AddAccountScreen;
