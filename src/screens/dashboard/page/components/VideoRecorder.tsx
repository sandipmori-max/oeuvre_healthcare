import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  BackHandler,
  Modal,
  useWindowDimensions,
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import RNFS from "react-native-fs";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import { useAppSelector } from "../../../../store/hooks";

const MAX_DURATION_MS = 20000;
const MAX_SIZE_MB = 25;

export default function VideoRecorder({ item }: any) {
  const cameraRef = useRef(null);
  const device = useCameraDevice("back");
const { height, width } = useWindowDimensions();  
  const isLandscape = width > height;
  const [showCamera, setShowCamera] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const [recordTime, setRecordTime] = useState(0); // seconds

  const theme = useAppSelector((state) => state?.theme.mode);

  // -------------------------------------------------
  // HARDWARE BACK → CLOSE CAMERA
  // -------------------------------------------------
  useEffect(() => {
    if (!showCamera) return;

    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      setShowCamera(false);
      return true;
    });

    return () => handler.remove();
  }, [showCamera]);

  // -------------------------------------------------
  // TIMER WHILE RECORDING
  // -------------------------------------------------
  useEffect(() => {
    let interval;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // -------------------------------------------------
  // PERMISSIONS
  // -------------------------------------------------
  const requestPermissions = async () => {
    const cam = await Camera.requestCameraPermission();
    const mic = await Camera.requestMicrophonePermission();

    if (
      (cam === "authorized" || cam === "granted") &&
      (mic === "authorized" || mic === "granted")
    ) {
      setPermissionsGranted(true);
      setShowCamera(true);
    } else {
      Alert.alert("Permissions Required", "Camera & Microphone are required.");
    }
  };

  const checkFileSize = async (path: string) => {
    const stat = await RNFS.stat(path);
    const sizeMB = stat.size / (1024 * 1024);
    return sizeMB <= MAX_SIZE_MB;
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordTime(0);

    cameraRef.current.startRecording({
      flash: "off",

      onRecordingFinished: async (video) => {
        setIsRecording(false);
        setLoading(true);

        const valid = await checkFileSize(video.path);
        const base64 = await RNFS.readFile(video.path, "base64");
        if (!valid) {
          Alert.alert("Warning", "Video exceeds 25 MB!");
        } else {
          Alert.alert("Video Saved", "Video recorded successfully!");
        }
        setLoading(false);
        setShowCamera(false);
      },

      onRecordingError: (err) => {
        Alert.alert("Error", "Recording failed");
        setIsRecording(false);
      },
    });

    setTimeout(() => {
      if (isRecording) stopRecording();
    }, MAX_DURATION_MS);
  };

  const stopRecording = () => {
    try {
      cameraRef.current.stopRecording();
    } catch (_) {}
    setIsRecording(false);
  };
  if (!showCamera) {
    return (
      <View>
        <Text style={[styles.label, theme === "dark" && { color: "white" }]}>
          {item?.fieldtitle}
        </Text>

        {item?.tooltip !== item?.fieldtitle && (
          <Text
            style={[styles.subLabel, theme === "dark" && { color: "white" }]}
          >
            {item?.tooltip}
          </Text>
        )}

        {item?.mandatory === "1" && (
          <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>
        )}

        <TouchableOpacity
          style={styles.squareCard}
          onPress={requestPermissions}
        >
          <MaterialIcons
            name="videocam"
            size={40}
            color={ERP_COLOR_CODE.ERP_APP_COLOR}
          />
          <Text style={styles.squareCardText}>Record Video</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Modal
      visible={showCamera}
      animationType="slide"
      presentationStyle="fullScreen"
      supportedOrientations={["portrait", "landscape"]}
    >
      <SafeAreaView style={styles.fullScreen}>
        {!permissionsGranted || !device ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff", marginTop: 10 }}>
              Loading camera...
            </Text>
          </View>
        ) : (
          <>
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
              video={true}
              audio={true}
            />
            {isRecording && (
              <View style={styles.timerContainer}>
                <View style={styles.redDot} />
                <Text style={styles.timerText}>{formatTime(recordTime)}</Text>
              </View>
            )}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Record Video</Text>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowCamera(false)}
              >
                <MaterialIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.bottomPanel}>
              {loading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : isRecording ? (
                <TouchableOpacity
                  style={styles.stopBtn}
                  onPress={stopRecording}
                >
                  <MaterialIcons name="stop" size={32} color="#fff" />
                  <Text style={styles.bottomText}>Stop</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.recordBtn}
                  onPress={startRecording}
                >
                  <MaterialIcons
                    name="fiber-manual-record"
                    size={36}
                    color="red"
                  />
                  <Text style={styles.bottomText}>Start Recording</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: "700", color: ERP_COLOR_CODE.ERP_333 },
  subLabel: { fontSize: 13, opacity: 0.7, color: ERP_COLOR_CODE.ERP_333 },
  squareCard: {
    width: "100%",
    aspectRatio: 2.8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ERP_COLOR_CODE.ERP_999,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  squareCardText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: ERP_COLOR_CODE.ERP_APP_COLOR,
  },
  startBtn: {
    width: "100%",
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  startBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  fullScreen: { flex: 1, backgroundColor: "#000" },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 0,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "black",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 200,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  closeBtn: { padding: 6 },
  timerContainer: {
    position: "absolute",
    top: 70,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 300,
  },
  redDot: {
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 10,
    marginRight: 8,
  },
  timerText: { color: "#fff", fontSize: 20, fontWeight: "600" },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingVertical: 22,
    alignItems: "center",
    backgroundColor: "black",
    zIndex: 200,
  },
  bottomText: { color: "#fff", marginTop: 6, fontSize: 16 },
  recordBtn: { alignItems: "center" },
  stopBtn: { alignItems: "center" },
});
