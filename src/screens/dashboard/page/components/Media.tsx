import MaterialIcons from '@react-native-vector-icons/material-icons';
import React, { useState } from 'react';
import {
  View,
  Image,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ERP_ICON } from '../../../../assets';

const Media = ({ item, handleAttachment, infoData, baseLink, isFromNew }: any) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const [loadingSmall, setLoadingSmall] = useState(false);
  const [loadingLarge, setLoadingLarge] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [imageScale, setImageScale] = useState(1); // for zooming

  // 🔹 helper to build image URL
  const getImageUri = (type: 'small' | 'large') => {
    const base =
      imageUri ||
      `${baseLink}fileupload/1/${infoData?.tableName}/${infoData?.id}/${
        type === 'small' ? `d_${item?.text}` : item?.text
      }`;
    return `${base}?cb=${cacheBuster}`;
  };

  const requestPermission = async (type: 'camera' | 'gallery') => {
    try {
      let permission;
      if (type === 'camera') {
        permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
      } else {
        permission =
          Platform.OS === 'ios'
            ? PERMISSIONS.IOS.PHOTO_LIBRARY
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }

      const result = await check(permission);
      if (result === RESULTS.GRANTED) return true;

      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    } catch (error) {
      console.log('Permission error:', error);
      return false;
    }
  };

  const renderMedia = () => {
    if (item?.ctltype === 'IMAGE') {
      return [
        {
          text: 'Camera',
          icon: 'photo-camera',
          onPress: async () => {
            const granted = await requestPermission('camera');
            if (!granted) return Alert.alert('Permission denied', 'Camera access is required');
            launchCamera({ mediaType: 'photo', quality: 0.8, includeBase64: true }, response => {
              if (response.assets && response.assets.length > 0) {
                const asset: Asset = response.assets[0];
                setImageUri(asset.uri || null);
                setCacheBuster(Date.now());
                handleAttachment(
                  `${item?.field}.jpeg; data:${asset.type};base64,${asset.base64}`,
                  item.field,
                );
              }
            });
          },
        },
      ];
    } else {
      return [
        {
          text: 'Gallery',
          icon: 'photo-library',
          onPress: async () => {
            const granted = await requestPermission('gallery');
            if (!granted) return Alert.alert('Permission denied', 'Gallery access is required');
            launchImageLibrary(
              { mediaType: 'photo', quality: 0.8, includeBase64: true },
              response => {
                if (response.assets && response.assets.length > 0) {
                  const asset: Asset = response.assets[0];
                  setImageUri(asset.uri || null);
                  setCacheBuster(Date.now());
                  handleAttachment(
                    `${item?.field}.jpeg; data:${asset.type};base64,${asset.base64}`,
                    item.field,
                  );
                }
              },
            );
          },
        },
      ];
    }
  };

  const handleChooseImage = () => {
    setPickerModalVisible(true);
  };

  return (
    <>
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>{item?.fieldtitle}</Text>
      <View style={styles.imageWrapper}>
        <TouchableOpacity
          onPress={() => {
            if (isFromNew) return;
            setModalVisible(true);
          }}
        >
          <View style={{ width: 100, height: 100 }}>
            {loadingSmall && (
              <ActivityIndicator style={StyleSheet.absoluteFill} size="small" color="#000" />
            )}
            <Image
              key={item.field}
              source={
                imageUri
                  ? { uri: imageUri }
                  : { uri: getImageUri('small') }
              }
              style={styles.imageThumb}
              onLoadStart={() => !imageUri && setLoadingSmall(true)}
              onLoadEnd={() => setLoadingSmall(false)}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleChooseImage} style={styles.editBtn}>
          <MaterialIcons name={'edit'} color={'#000'} size={20} />
        </TouchableOpacity>
      </View>

      {/* Fullscreen Preview Modal with Zoom */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setImageScale(1);
          setModalVisible(false);
        }}
      >
        <View style={styles.fullscreenModalOverlay}>
          <View style={styles.fullscreenModalContent}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setImageScale(1);
                setModalVisible(false);
              }}
            >
              <MaterialIcons name="close" size={30} color="#fff" />
            </TouchableOpacity>

            {loadingLarge && (
              <ActivityIndicator
                style={StyleSheet.absoluteFill}
                size="large"
                color="#fff"
              />
            )}

            {/* Image with scale */}
            <Image
              source={{ uri: getImageUri('large') }}
              style={[styles.fullscreenImage, { transform: [{ scale: imageScale }] }]}
              resizeMode="contain"
              onLoadStart={() => setLoadingLarge(true)}
              onLoadEnd={() => setLoadingLarge(false)}
            />

            {/* Zoom buttons */}
            <View style={styles.zoomButtons}>
              <TouchableOpacity
                style={styles.zoomBtn}
                onPress={() => setImageScale(prev => Math.min(prev + 0.2, 3))}
              >
                <MaterialIcons name="zoom-in" size={30} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.zoomBtn}
                onPress={() => setImageScale(prev => Math.max(prev - 0.2, 1))}
              >
                <MaterialIcons name="zoom-out" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={pickerModalVisible}
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Image</Text>
              <TouchableOpacity onPress={() => setPickerModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.optionRow}>
              {renderMedia().map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.optionCard}
                  onPress={async () => {
                    setPickerModalVisible(false);
                    await option.onPress();
                  }}
                >
                  <MaterialIcons name={option.icon} size={36} color="#000" />
                  <Text style={styles.optionLabel}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    width: '100%',
    marginVertical: 4,
  },
  imageThumb: {
    borderWidth: 1,
    width: 100,
    height: 100,
  },
  editBtn: {
    height: 36,
    width: 36,
    borderRadius: 36,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 28,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    left: Dimensions.get('screen').width / 4.98,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    alignItems: 'center',
    maxHeight: '60%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 12,
  },
  optionCard: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  optionLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },

  // Fullscreen modal styles
  fullscreenModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenModalContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  zoomButtons: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '40%',
    alignSelf: 'center',
  },
  zoomBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 50,
  },
});

export default Media;
