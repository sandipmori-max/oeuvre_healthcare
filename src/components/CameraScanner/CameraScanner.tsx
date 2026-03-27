import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { styles } from './CameraScanner.styles';
import { RNHoleView } from 'react-native-hole-view';
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { useAppStateListener } from '../../hooks/useAppStateListener';
import { ICameraScannerProps } from '../../utils/helpers/types';
import { getWindowHeight, getWindowWidth, isIos } from '../../utils/helpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTranslation } from 'react-i18next';
import { uiStyles } from './style';

export const CameraScanner = ({
  setIsCameraShown,
  onReadCode,
}: ICameraScannerProps) => {
  const {t} = useTranslation()
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();
  const [isCameraInitialized, setIsCameraInitialized] = useState(isIos);
  const [isActive, setIsActive] = useState(isIos);
  const [flash, setFlash] = useState<'on' | 'off'>(isIos ? 'off' : 'on');
  const { appState } = useAppStateListener();
  const [codeScanned, setCodeScanned] = useState('');

  useEffect(() => {
    if (codeScanned) {
      onReadCode(codeScanned);
    }
  }, [codeScanned, onReadCode]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isCameraInitialized) {
      timeout = setTimeout(() => {
        setIsActive(true);
        setFlash('off');
      }, 1000);
    }
    setIsActive(false);
    return () => {
      clearTimeout(timeout);
    };
  }, [isCameraInitialized]);

  const onInitialized = () => setIsCameraInitialized(true);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        setIsActive(false);
        setTimeout(() => setCodeScanned(codes[0]?.value), 500);
      }
    },
  });

  const onCrossClick = () => setIsCameraShown(false);

  const onError = (error: CameraRuntimeError) => {
    Alert.alert('Error!', error.message);
  };

  if (device == null) {
    Alert.alert('Error!', 'Camera could not be started');
  }

  if (isFocused && device) {
    return (
      <SafeAreaView style={styles.safeArea} >
        <Modal supportedOrientations={["portrait", "landscape"]} presentationStyle="fullScreen" animationType="slide">
          {/* ---------- Header ---------- */}
          <View style={uiStyles.header}>
            <Text style={uiStyles.headerTitle}>{t('test19')}</Text>
            <TouchableOpacity style={uiStyles.closeBtn} onPress={onCrossClick}>
              <MaterialIcons name="close" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ---------- Description ---------- */}
          <View style={uiStyles.descriptionContainer}>
            <Text style={uiStyles.descriptionText}>
              {t('test20')}
            </Text>
          </View>

          {/* ---------- Camera ---------- */}
          <Camera
            torch={flash}
            onInitialized={onInitialized}
            ref={camera}
            onError={onError}
            photo={false}
            style={styles.fullScreenCamera}
            device={device}
            codeScanner={codeScanner}
            isActive={
              isActive &&
              isFocused &&
              appState === 'active' &&
              isCameraInitialized
            }
          />

          {/* ---------- Scanning Window ---------- */}
          <RNHoleView
            holes={[
              {
                x: getWindowWidth() * 0.1,
                y: getWindowHeight() * 0.25,
                width: getWindowWidth() * 0.8,
                height: getWindowHeight() * 0.35,
                borderRadius: 12,
              },
            ]}
            style={[styles.rnholeView, styles.fullScreenCamera]}
          />

          {/* ---------- Bottom Fade Panel ---------- */}
          <View style={uiStyles.bottomPanel}>
            <Text style={uiStyles.bottomText}>{t('test18')}</Text>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
};