import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
} from 'react-native';

const UpdateModal = ({ visible, forceUpdate, storeUrl, onSkip }) => {
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
          <Text style={styles.title}>Update Available 🚀</Text>

          <Text style={styles.desc}>
            A new version of the app is available. Please update to continue
            using the app with latest features.
          </Text>

          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => Linking.openURL(storeUrl)}
          >
            <Text style={styles.updateText}>Update Now</Text>
          </TouchableOpacity>

          {!forceUpdate && (
            <TouchableOpacity onPress={onSkip}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default UpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  desc: {
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
  },
  updateBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  updateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    color: '#999',
    marginTop: 6,
  },
});
