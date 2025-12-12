import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {styles} from './CameraScanner.styles';
import {RNHoleView} from 'react-native-hole-view';
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useIsFocused} from '@react-navigation/native';
import {useAppStateListener} from '../../hooks/useAppStateListener';
import {ICameraScannerProps} from '../../utils/helpers/types';
import {getWindowHeight, getWindowWidth, isIos} from '../../utils/helpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';

 
export const CameraScanner = ({
  setIsCameraShown,
  onReadCode,
}: ICameraScannerProps) => {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();
  const [isCameraInitialized, setIsCameraInitialized] = useState(isIos);
  const [isActive, setIsActive] = useState(isIos);
  const [flash, setFlash] = useState<'on' | 'off'>(isIos ? 'off' : 'on');
  const {appState} = useAppStateListener();
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
      <SafeAreaView style={styles.safeArea}>
        <Modal presentationStyle="fullScreen" animationType="slide">
          {/* ---------- Header ---------- */}
          <View style={uiStyles.header}>
            <Text style={uiStyles.headerTitle}>Scan Code</Text>
            <TouchableOpacity style={uiStyles.closeBtn} onPress={onCrossClick}>
              <MaterialIcons name="close" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ---------- Description ---------- */}
          <View style={uiStyles.descriptionContainer}>
            <Text style={uiStyles.descriptionText}>
              Align the QR code inside the frame to scan automatically.
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
            <Text style={uiStyles.bottomText}>Scanning...</Text>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
};
export const uiStyles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 50,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },

  closeBtn: {
    padding: 4,
  },

  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  descriptionText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },

  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  bottomText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
});
