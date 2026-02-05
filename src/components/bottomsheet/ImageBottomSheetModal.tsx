import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.8;

const ImageBottomSheetModal = ({
  visible,
  onClose,
  imageUrl,
}) => {
  const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      setLoading(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: MODAL_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  if (!showModal) return null;

  return (
    <Modal transparent animationType="none">
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY }] },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
         

          {/* Image */}
          <View style={styles.imageWrapper}>
            {loading && (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#666" />
              </View>
            )}

            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ImageBottomSheetModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  container: {
    height: MODAL_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 4,
    alignSelf: 'center',
    marginVertical: 8,
  },

  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },

  closeIcon: {
    fontSize: 22,
    color: '#444',
  },

  imageWrapper: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    resizeMode: 'cover',
    backgroundColor: '#F2F2F2',
  },

  loader: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
