import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { styles } from "./CameraScanner.styles";
import { RNHoleView } from "react-native-hole-view";
import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";

import { useIsFocused } from "@react-navigation/native";
import { useAppStateListener } from "../../hooks/useAppStateListener";
import { ICameraScannerProps } from "../../utils/helpers/types";

import {
  getWindowHeight,
  getWindowWidth,
  isIos,
} from "../../utils/helpers";

import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useTranslation } from "react-i18next";
import { ui } from "./style";

export const BarCodeCameraScanner = ({
  setIsCameraShown,
  onReadCode,
}: ICameraScannerProps) => {
  const {t} = useTranslation()
  const device = useCameraDevice("back");
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();
  const { appState } = useAppStateListener();
const { height, width } = useWindowDimensions();  
  const isLandscape = width > height;
  const [isCameraInitialized, setIsCameraInitialized] = useState(isIos);
  const [isActive, setIsActive] = useState(isIos);
  const [flash, setFlash] = useState<"on" | "off">(isIos ? "off" : "on");
  const [codeScanned, setCodeScanned] = useState("");

  // PASS VALUE TO PARENT
  useEffect(() => {
    if (codeScanned) {
      onReadCode(codeScanned);
    }
  }, [codeScanned]);

  // CAMERA INIT HANDLER
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isCameraInitialized) {
      timeout = setTimeout(() => {
        setIsActive(true);
        setFlash("off");
      }, 800);
    }

    setIsActive(false);
    return () => clearTimeout(timeout);
  }, [isCameraInitialized]);

  const onInitialized = () => setIsCameraInitialized(true);

  // BARCODE + QR SUPPORT
  const codeScanner = useCodeScanner({
    codeTypes: [
      "ean-13",
      "ean-8",
      "code-128",
      "code-39",
      "codabar",
      "itf",
      "upc-a",
      "upc-e",
    ],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
        setIsActive(false);
        setTimeout(() => setCodeScanned(codes[0].value), 300);
      }
    },
  });

  const onError = (error: CameraRuntimeError) => {
    Alert.alert("Error!", error.message);
  };

  // ANDROID HARDWARE BACK BUTTON
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setIsCameraShown(false);
      return true;
    });
    return () => sub.remove();
  }, []);

  if (!device) {
    Alert.alert("Error!", "Camera device not found!");
    return null;
  }

  if (!isFocused) return null;

  return (
    <SafeAreaView style={styles.safeArea} >
      <Modal presentationStyle="fullScreen" supportedOrientations={["portrait", "landscape"]}animationType="slide">
        <View style={{ flex: 1 }}>

          {/* CAMERA */}
          <Camera
            torch={flash}
            ref={camera}
            photo={false}
            device={device}
            style={styles.fullScreenCamera}
            onInitialized={onInitialized}
            onError={onError}
            codeScanner={codeScanner}
            isActive={
              isActive &&
              isFocused &&
              appState === "active" &&
              isCameraInitialized
            }
          />

          {/* SCAN WINDOW */}
          <RNHoleView
            holes={[
              {
                x: getWindowWidth() * 0.05,
                y: getWindowHeight() * 0.30,
                width: getWindowWidth() * 0.9,
                height: getWindowHeight() * 0.25,
                borderRadius: 8,
              },
            ]}
            style={styles.rnholeView}
          />

          {/* BACK BUTTON */}
          <TouchableOpacity
            style={ui.backButton}
            onPress={() => setIsCameraShown(false)}
          >
            <MaterialIcons name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>

          {/* DESCRIPTION */}
          <View style={ui.descriptionBox}>
            <Text style={ui.descriptionText}>
              {t('test17')}
            </Text>
          </View>

          {/* BOTTOM PANEL */}
          <View style={ui.bottomPanel}>
            <Text style={ui.bottomText}>{t('test18')}</Text>
          </View>

        </View>
      </Modal>
    </SafeAreaView>
  );
};
