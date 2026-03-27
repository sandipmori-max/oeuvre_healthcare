import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Linking,
  useWindowDimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { styles } from "./style";

const UpdateModal = ({ visible, forceUpdate, storeUrl, onSkip }: any) => {
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(300)).current;

  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    if (visible) {
      translateY.setValue(300); // reset
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      supportedOrientations={["portrait", "landscape"]}
      transparent
      visible={visible}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={!forceUpdate ? onSkip : undefined}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.bottomContainer}>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
              width: isLandscape ? "60%" : "100%",
              alignSelf: "center",
            },
          ]}
        >
          {/* Drag Indicator */}
          <View style={styles.dragHandle} />

          {/* Title */}
          <Text style={styles.title}>{t("test13")}</Text>

          {/* Description */}
          <Text style={styles.desc}>{t("test14")}</Text>

          {/* Update Button */}
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => Linking.openURL(storeUrl)}
          >
            <Text style={styles.updateText}>{t("test15")}</Text>
          </TouchableOpacity>

          {/* Skip Button (optional update only) */}
          {!forceUpdate && (
            <TouchableOpacity onPress={onSkip}>
              <Text style={styles.skipText}>{t("test16")}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default UpdateModal;