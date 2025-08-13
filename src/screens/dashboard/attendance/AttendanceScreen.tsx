import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import {Formik} from 'formik';
import * as Yup from 'yup';
import CustomAlert from '../../../components/CustomAlert';
import {styles} from './attandance_style';
import useTranslations from '../../../hooks/useTranslations';
import FullViewLoader from '../../../components/FullViewLoader';

// Type definitions for user and location
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  status: 'checkin' | 'checkout';
}
interface UserLocation {
  latitude: number;
  longitude: number;
}

interface AttendanceFormValues {
  name: string;
  email: string;
  status: 'checkin' | 'checkout';
  latitude: string; // keep as string for TextInput
  longitude: string;
  remark: string;
  dateTime: string;
}

const dummyUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
  status: 'checkin',
};

const AttendanceScreen = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslations();
  const [user, setUser] = useState<User>(dummyUser);
  const [statusImage, setStatusImage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const requestCameraAndLocationPermission = async (): Promise<boolean> => {
    try {
      const cameraPerm = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
      const locationPerm = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const cameraStatus = await check(cameraPerm);
      const locationStatus = await check(locationPerm);

      const cameraGranted = cameraStatus === RESULTS.GRANTED
        ? true
        : (await request(cameraPerm)) === RESULTS.GRANTED;

      const locationGranted = locationStatus === RESULTS.GRANTED
        ? true
        : (await request(locationPerm)) === RESULTS.GRANTED;

      return cameraGranted && locationGranted;
    } catch (error) {
      console.warn('Permission error:', error);
      return false;
    }
  };

  // Toggle current user's status with location + camera capture
  const handleStatusToggle = async (
    setFieldValue: (field: keyof AttendanceFormValues, value: any) => void
  ) => {
    if (locationLoading) return; // Prevent double click
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
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setFieldValue('latitude', String(latitude));
        setFieldValue('longitude', String(longitude));
        setLocationLoading(false);

        // Only after location, open camera
        launchCamera(
          {
            mediaType: 'photo',
            cameraType: 'back',
            quality: 0.7,
            saveToPhotos: true,
          },
          (response) => {
            if (response.didCancel || response.errorCode) {
              console.log('User cancelled or error:', response.errorMessage);
              return;
            }

            const photoUri = response.assets?.[0]?.uri;
            if (!photoUri) return;

            // Toggle status
            setUser((prev) => ({
              ...prev,
              status: (prev.status === 'checkin' ? 'checkout' : 'checkin') as 'checkin' | 'checkout',
            }));
            setFieldValue(
              'status',
              (user.status === 'checkin' ? 'checkout' : 'checkin') as 'checkin' | 'checkout'
            );
            setStatusImage(photoUri);
          }
        );
      },
      (error) => {
        setLocationLoading(false);
        setAlertConfig({
          title: t('errors.locationError'),
          message: error.message,
          type: 'error',
        });
        setAlertVisible(true);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
    );
  };

  const formatDateTime = (d: Date) => {
    try {
      return d.toLocaleString();
    } catch {
      return d.toISOString();
    }
  };

  return (
    <View style={styles.container}>
      
      {isLoading ? (
                     <FullViewLoader />
      ) : (
        <>
          <View style={{ padding: 16 }}>
            <Formik
              initialValues={{
                name: user.name,
                email: user.email,
                status: user.status,
                latitude: userLocation ? String(userLocation.latitude) : '',
                longitude: userLocation ? String(userLocation.longitude) : '',
                remark: '',
                dateTime: formatDateTime(new Date()),
              }}
              validationSchema={Yup.object({
                name: Yup.string().required(t('attendance.nameRequired')),
                email: Yup.string().email(t('attendance.emailInvalid')).required(t('attendance.emailRequired')),
                status: Yup.mixed<'checkin' | 'checkout'>()
                  .oneOf(['checkin', 'checkout'])
                  .required(t('attendance.statusRequired')),
                latitude: Yup.string().optional(),
                longitude: Yup.string().optional(),
                remark: Yup.string().optional(),
                dateTime: Yup.string().optional(),
              })}
              onSubmit={() => {}}
            >
              {({ values, errors, touched, setFieldValue }) => (
                <View style={styles.profileCard}>
                  <View style={styles.profileRow}>
                    <View style={styles.imageCol}>
                      <Image source={{ uri: user.image }} style={styles.profileAvatar} />
                    </View>
                    
                  </View>

                  {/* Form Fields */}
                 <View style={{bottom: 52}}>
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
                    <TextInput
                      style={[styles.input, styles.inputReadonly]}
                      value={values.dateTime}
                      editable={false}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{t('attendance.email')}</Text>
                    <TextInput
                      style={[styles.input, styles.inputReadonly]}
                      value={values.email}
                      editable={false}
                    />
                    {touched.email && errors.email ? (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    ) : null}
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>{t('attendance.remark')}</Text>
                    <TextInput
                      style={[styles.input]}
                      value={values.remark}
                      onChangeText={(text) => setFieldValue('remark', text)}
                      placeholder={t('attendance.enterRemark')}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                   {
                    statusImage &&  <>
                  <View >
                      {statusImage ? (
                        <Image source={{ uri: statusImage }} style={styles.selfyAvatar} />
                      ) : (
                        <View style={[styles.selfyAvatar, styles.placeholderAvatar]} />
                      )}
                      <Text style={styles.imageLabel}>{t('attendance.capturedPhoto')}</Text>
                    </View>
                 </>
                  }
                  <View style={{marginVertical: 12}}>
                     <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        { backgroundColor: user.status === 'checkin' ? '#28a745' : '#dc3545' },
                        locationLoading && { opacity: 0.5 },
                      ]}
                      onPress={() => handleStatusToggle(setFieldValue)}
                      disabled={locationLoading}
                    >
                      <Text style={styles.statusText}>
                        {user.status === 'checkin' ? t('attendance.checkOut') : t('attendance.checkIn')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                 </View>
                </View>
              )}
            </Formik>

            
          </View>

          {/* Loader Overlay */}
          {locationLoading && (
            <View style={styles.loaderOverlay} pointerEvents="auto">
              <ActivityIndicator size="large" color="#673AB7" />
            </View>
          )}
        </>
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

export default AttendanceScreen;
