import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  TouchableWithoutFeedback,
} from 'react-native';

const ExitBottomSheet = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const backAction = () => {
      setVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const handleExit = () => {
    setVisible(false);
    BackHandler.exitApp();
  };

  return (
    <Modal transparent supportedOrientations={["portrait", "landscape"]} visible={visible} animationType="fade">
      {/* Background */}
      <TouchableWithoutFeedback onPress={() => setVisible(false)}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Bottom Sheet */}
      <View style={styles.container}>
        <View style={styles.sheet}>

          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Title */}
          <Text style={styles.title}>Exit App</Text>

          {/* Message */}
          <Text style={styles.message}>
            Are you sure you want to exit the app?
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exitBtn}
              onPress={handleExit}
            >
              <Text style={styles.exitText}>Exit</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default ExitBottomSheet;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },

  sheet: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10, // Android shadow
  },

  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },

  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },

  cancelText: {
    color: '#333',
    fontWeight: '500',
  },

  exitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
  },

  exitText: {
    color: '#fff',
    fontWeight: '600',
  },
});