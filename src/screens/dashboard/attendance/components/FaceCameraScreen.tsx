import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  useWindowDimensions,
  Alert,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  useCameraFormat,
} from "react-native-vision-camera";
import { useFaceDetector } from "react-native-vision-camera-face-detector";
import { Worklets } from "react-native-worklets-core";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import ImageResizer from "@bam.tech/react-native-image-resizer";
import RNFS from "react-native-fs";

const FaceCameraScreen = ({ navigation, route }: any) => {
  const { onCapture } = route.params;
  const camera = useRef(null);

  const device = useCameraDevice("front");

  const [hasPermission, setHasPermission] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  useEffect(() => {
    const getPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === "granted");
    };
    getPermission();
  }, []);

  const { detectFaces } = useFaceDetector({
    performanceMode: "fast",
    landmarkMode: "all",
  });

  const updateFacesJS = Worklets.createRunOnJS((faces) => {
    setFaceDetected(faces.length > 0);
  });

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
    const faces = detectFaces(frame);
    updateFacesJS(faces);
  }, []);

 const takePhoto = async () => {
  try {
    const photo = await camera?.current?.takePhoto({
      qualityPrioritization: "speed",
      flash: "off",
      enableAutoRedEyeReduction: true,
      skipMetadata: true,
      enableShutterSound: true,
      quality: 0.3,
      width: 640,
      height: 480, 
    });

    const photoPath = photo?.path;

    const originalStat = await RNFS.stat(photoPath);
    const originalSizeKB = (originalStat.size / 1024).toFixed(2);

    console.log("📸 Original Path:", photoPath);
    console.log("📦 Original Size:", originalSizeKB, "KB");

    let compressedImage;

    try {
      compressedImage = await ImageResizer.createResizedImage(
        photoPath,
        600,
        600,
        "JPEG",
        60,
        0,
        undefined,
        false,
        { mode: "contain" }
      );
    } catch (err) {
      console.log("⚠️ Primary compression failed, fallback...");

      compressedImage = await ImageResizer.createResizedImage(
        photoPath,
        400,
        400,
        "JPEG",
        50,
        0
      );
    }
    
    
    // 👉 SAFE PATH HANDLING
    const compressedPath =
      Platform.OS === "android"
        ? compressedImage.uri.replace("file://", "")
        : compressedImage.uri;

    const compressedStat = await RNFS.stat(compressedPath);
    const compressedSizeKB = (compressedStat.size / 1024).toFixed(2);

    console.log("🗜️ Compressed Path:", compressedImage.uri);
    console.log("📦 Compressed Size:", compressedSizeKB, "KB");

    Alert.alert("originalSizeKB" , `originalSizeKB ${originalSizeKB} and Compressed : ${compressedSizeKB}`)
    // ✅ FINAL OUTPUT
    onCapture(compressedImage?.uri);

    navigation.goBack();
  } catch (error) {
    console.log("❌ error++++++", error);
  }
};

  const format = useCameraFormat(device, [
    { photoResolution: { width: 1280, height: 1280 } }, // 🔥 prevents crash
  ]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting Camera Permission...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>Loading Camera...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Camera */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={3}
        format={format}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          isLandscape && {
            top: 10,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Face Verification</Text>

        <View style={{ width: 30 }} />
      </View>
      <View style={styles.faceFrameContainer}>
        <View
          style={[
            styles.faceFrame,
            !isLandscape && {
              borderWidth: 1,

              borderColor: faceDetected ? "#00ff00" : "#ff3b30",
            },
          ]}
        />
      </View>

      <View
        style={[
          styles.messageContainer,
          isLandscape && {
            top: 50,
          },
        ]}
      >
        <Text style={styles.message}>
          {faceDetected ? "Face Detected" : "Align your face in the frame"}
        </Text>
      </View>
      {/* Face Frame */}

      {/* Message */}

      {/* Capture Button */}

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          disabled={!faceDetected}
          onPress={takePhoto}
          style={[styles.captureOuter, { opacity: faceDetected ? 1 : 0.4 }]}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    position: "absolute",
    top: Platform.OS === "android" ? 20 : 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    // backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingVertical: 12,
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  faceFrameContainer: {
    position: "absolute",
    top: "18%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  faceFrame: {
    width: Dimensions.get("screen").width * 0.94,
    height: Dimensions.get("screen").height * 0.5,
    borderRadius: 10,
  },

  messageContainer: {
    position: "absolute",
    top: "11%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },

  message: {
    color: "#fff",
    fontSize: 14,
  },

  bottomContainer: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },

  captureOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  captureInner: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
});

export default FaceCameraScreen;
