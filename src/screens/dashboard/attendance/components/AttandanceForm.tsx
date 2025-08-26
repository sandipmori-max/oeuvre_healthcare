import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Geolocation from '@react-native-community/geolocation';
import { launchCamera } from 'react-native-image-picker';

import { AttendanceFormValues, User, UserLocation } from '../types';
import { requestCameraAndLocationPermission } from '../../../../utils/helpers';
import useTranslations from '../../../../hooks/useTranslations';
import { styles } from '../attandance_style';
import CustomAlert from '../../../../components/alert/CustomAlert';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { markAttendanceThunk } from '../../../../store/slices/attandance/thunk';
import { ERP_COLOR_CODE } from '../../../../utils/constants';

const dummyUser: User = {
  id: '1',
  name: 'John Doe',
  phone: '123-456-7890',
  image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
  status: 'checkin',
};

const AttandanceForm = () => {
  const { t } = useTranslations();

  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector(state => state?.auth);
  const { loading, error, response } = useAppSelector(state => state.attendance);

  const [users, setUser] = useState<User>(dummyUser);
  const [statusImage, setStatusImage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  const openCamera = (
    setFieldValue: (field: keyof AttendanceFormValues, value: any) => void,
    handleSubmit: () => void,
  ) => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.7,
        saveToPhotos: true,
        includeBase64: true,
      },
      response => {
        if (response.didCancel || response.errorCode) {
          console.log('User cancelled or error:', response.errorMessage);
          return;
        }

        const photoUri = response.assets?.[0]?.uri;
        console.log("🚀 ~ openCamera ~ photoUri:", photoUri)
        const asset = response.assets?.[0];
        if (!photoUri) return;
        console.log("🚀 ~ openCamera ~ photoUri:", photoUri)

        setFieldValue(
          'status',
          (users.status === 'checkin' ? 'checkout' : 'checkin') as 'checkin' | 'checkout',
        );

        if (asset?.base64) {
          setFieldValue("imageBase64", `data:${asset.type};base64,${asset.base64}`);
        }
        setStatusImage(photoUri);

        setTimeout(() => {
          handleSubmit();
        }, 1000);
      },
    );
  };

  const handleStatusToggle = async (
    setFieldValue: (field: keyof AttendanceFormValues, value: any) => void,
    handleSubmit: () => void,
  ) => {
    if (locationLoading) return;

    const hasPermission = await requestCameraAndLocationPermission();
    if (!hasPermission) {
      setAlertConfig({
        title: t('errors.permissionRequired'),
        message: t('errors.cameraLocationPermission'),
        type: 'error',
      });
      setAlertVisible(true);
      return;
    }

    setLocationLoading(true);

    let attempts = 0;
    const getLocationWithRetry = () => {
      let watchId: number | null = null;

      watchId = Geolocation.watchPosition(
        position => {
          if (watchId !== null) {
            Geolocation.clearWatch(watchId);
          }

          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setFieldValue('latitude', String(latitude));
          setFieldValue('longitude', String(longitude));
          setLocationLoading(false);

          openCamera(setFieldValue, handleSubmit);
        },
        error => {
          if (watchId !== null) {
            Geolocation.clearWatch(watchId);
          }

          attempts += 1;
          if (attempts < 3) {
            console.log(`⏳ Retrying location fetch... attempt ${attempts}`);
            setTimeout(() => getLocationWithRetry(), 2000 * attempts);
          } else {
            setLocationLoading(false);
            setAlertConfig({
              title: t('errors.locationError'),
              message: error.message || 'Unable to fetch location',
              type: 'error',
            });
            setAlertVisible(true);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 60000,
          maximumAge: 0,
          distanceFilter: 0,
        },
      );
    };

    getLocationWithRetry();
  };

  return (
    <View>
      <Formik
        initialValues={{
          name: user?.name,
          status: users.status,
          latitude: userLocation ? String(userLocation.latitude) : '',
          longitude: userLocation ? String(userLocation.longitude) : '',
          remark: '',
          dateTime: new Date().toISOString(),
          imageBase64: '',
        }}
        validationSchema={Yup.object({
          name: Yup.string().required(t('attendance.nameRequired')),
          status: Yup.mixed<'checkin' | 'checkout'>()
            .oneOf(['checkin', 'checkout'])
            .required(t('attendance.statusRequired')),
          latitude: Yup.string().optional(),
          longitude: Yup.string().optional(),
          remark: Yup.string().optional(),
          dateTime: Yup.string().optional(),
          imageBase64: Yup.string().required('Image required'),
        })}
        onSubmit={values => {
          console.log("🚀 ~ values:", values)
          dispatch(markAttendanceThunk({ page: 'puncin', rawData: values }))
            .unwrap()
            .then(res => {
              console.log('✅ API Success:', res);

              setAlertConfig({
                title: 'Success',
                message: 'Attendance marked successfully!',
                type: 'success',
              });
              setAlertVisible(true);

              setUser(prev => ({
                ...prev,
                status: prev.status === 'checkin' ? 'checkout' : 'checkin',
              }));
            })
            .catch(err => {
              console.log('❌ API Error:', err);
              setAlertConfig({
                title: 'Error',
                message: err || 'Something went wrong',
                type: 'error',
              });
              setAlertVisible(true);
            });
        }}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.imageCol}>
                <Image source={{ uri: users.image }} style={styles.profileAvatar} />
              </View>
            </View>

            <View style={{ bottom: 52 }}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('attendance.employeeName')}</Text>
                <TextInput
                  style={[styles.input, styles.inputReadonly]}
                  value={values.name}
                  editable={false}
                />
                {touched.name && errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('attendance.dateTime')}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TextInput
                    style={[styles.input, styles.inputReadonly, { flex: 1, marginRight: 8 }]}
                    value={new Date(values.dateTime).toLocaleDateString()}
                    editable={false}
                  />
                  <TextInput
                    style={[styles.input, styles.inputReadonly, { flex: 1 }]}
                    value={new Date(values.dateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('attendance.remark')}</Text>
                <TextInput
                  style={[styles.input]}
                  value={values.remark}
                  onChangeText={text => setFieldValue('remark', text)}
                  placeholder={t('attendance.enterRemark')}
                  multiline
                  numberOfLines={3}
                />
              </View>
              {statusImage && (
                <>
                  <View>
                    {statusImage ? (
                      <Image source={{ uri: statusImage }} style={styles.selfyAvatar} />
                    ) : (
                      <View style={[styles.selfyAvatar, styles.placeholderAvatar]} />
                    )}
                    <Text style={styles.imageLabel}>{t('attendance.capturedPhoto')}</Text>
                  </View>
                </>
              )}
              <View style={{ marginVertical: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.statusBtn,
                    {
                      backgroundColor: users.status === 'checkin' ? ERP_COLOR_CODE.ERP_APP_COLOR : '#dc3545',
                    },
                    locationLoading && { opacity: 0.5 },
                  ]}
                  onPress={() => handleStatusToggle(setFieldValue, handleSubmit)}
                  disabled={locationLoading}
                >
                  <Text style={styles.statusText}>
                    {users.status === 'checkin' ? t('attendance.checkOut') : t('attendance.checkIn')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Formik>

      {locationLoading && (
        <View style={styles.loaderOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#673AB7" />
        </View>
      )}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default AttandanceForm;
