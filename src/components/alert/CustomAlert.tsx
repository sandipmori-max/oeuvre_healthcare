import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Linking,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import FastImage from 'react-native-fast-image';

import { CustomAlertProps } from '../types';
import { getGifSource } from '../../utils/helpers';
import { styles } from './custom_alert_style';
import { getAlertStyles } from './helper';
import ERPTextInput from '../input/ERPTextInput';
import { ERP_COLOR_CODE } from '../../utils/constants';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAppSelector } from '../../store/hooks';

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onDone,
  onCancel,
  doneText = 'Done',
  cancelText = 'Cancel',
  isFromButtonList = false,
  actionLoader,
  color = ERP_COLOR_CODE.ERP_BLACK,
  isBottomButtonVisible,
  isSettingVisible,
}) => {
  const alertStyles = getAlertStyles(type);
  const gifSource = getGifSource(type);
  const theme = useAppSelector(state => state?.theme.mode);

  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  /* =======================
     Animations
  ======================= */
  const containerAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.stagger(120, [
        Animated.timing(containerAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      containerAnim.setValue(0);
      headerAnim.setValue(0);
      contentAnim.setValue(0);
      buttonAnim.setValue(0);
    }
  }, [visible]);

  /* =======================
     Back Handler
  ======================= */
  useEffect(() => {
    const onBackPress = () => {
      if (visible) {
        onClose?.();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [visible, onClose]);

  useEffect(() => {
    if (visible) {
      setRemarks('');
      setError('');
    }
  }, [visible]);

  const handleChangedRemarks = (val: string) => {
    setRemarks(val);
    if (val.trim()) setError('');
  };

  const handleDonePress = () => {
    if (isFromButtonList && !remarks.trim()) {
      setError('Please enter remarks before proceeding.');
      return;
    }
    onDone?.(remarks);
  };

  /* =======================
     Render
  ======================= */
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.bottomSheet,
            alertStyles.container,
            theme === 'dark' && {
              backgroundColor: 'black',
              borderWidth: 1,
              borderColor: 'white',
            },
            {
              opacity: containerAnim,
              transform: [
                {
                  translateY: containerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <Animated.View style={{ opacity: headerAnim }}>
            <View style={styles.header}>
              <Text style={alertStyles.title}>{title || ''}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* GIF */}
          {!isFromButtonList && (
            <Animated.View
              style={{
                opacity: contentAnim,
                transform: [{ scale: contentAnim }],
              }}
            >
              <FastImage
                source={gifSource}
                style={styles.gif}
                resizeMode={FastImage.resizeMode.contain}
              />
            </Animated.View>
          )}

          {/* Message / Input */}
          <Animated.View style={{ opacity: contentAnim }}>
            {isFromButtonList ? (
              <View style={{ width: '100%' }}>
                <Text
                  style={[
                    alertStyles.message,
                    { textAlign: 'left', fontSize: 14, fontWeight: '800' },
                  ]}
                >
                  {message || ''}
                </Text>

                <ERPTextInput
                  label="Remarks"
                  placeholder="Enter remarks"
                  placeholderTextColor={ERP_COLOR_CODE.ERP_999}
                  autoCapitalize="none"
                  onChangeText={handleChangedRemarks}
                  value={remarks}
                  labelStyle={[styles.inputLabel, { fontWeight: '400', fontSize: 12 }]}
                  inputStyle={[styles.input]}
                />

                {error ? (
                  <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>{error}</Text>
                ) : null}
              </View>
            ) : (
              <Text style={alertStyles.message}>{message || ''}</Text>
            )}
          </Animated.View>

          {/* Buttons */}
          {isBottomButtonVisible && (
            <Animated.View
              style={{
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <View style={styles.buttonRow}>
                {onCancel && (
                  <TouchableOpacity
                    style={styles.buttonCancel}
                    onPress={() => {
                      setRemarks('');
                      setError('');
                      onCancel();
                    }}
                  >
                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                  </TouchableOpacity>
                )}

                {onDone && (
                  actionLoader ? (
                    <TouchableOpacity style={styles.buttonCancel}>
                      <ActivityIndicator size="small" color={ERP_COLOR_CODE.ERP_BLACK} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: color }]}
                      onPress={() => {
                        setRemarks('');
                        setError('');
                        handleDonePress();
                      }}
                    >
                      <Text style={styles.buttonText}>{doneText}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </Animated.View>
          )}

          {/* Settings */}
          {isSettingVisible && (
            <Animated.View style={{ opacity: buttonAnim }}>
              <TouchableOpacity onPress={() => Linking.openSettings()}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialIcons name="settings" size={20} color="#000" />
                  <Text
                    style={{
                      color: ERP_COLOR_CODE.ERP_BLACK,
                      fontWeight: '600',
                      fontSize: 16,
                    }}
                  >
                    Open Settings
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
