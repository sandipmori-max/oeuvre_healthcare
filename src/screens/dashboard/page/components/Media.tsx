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

const Media = ({ item, handleAttachment, infoData, baseLink }: any) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const [loadingSmall, setLoadingSmall] = useState(false);
  const [loadingLarge, setLoadingLarge] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

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
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={{ width: 100, height: 100 }}>
            {loadingSmall && (
              <ActivityIndicator style={StyleSheet.absoluteFill} size="small" color="#000" />
            )}
            <Image
              key={item.field}
              source={{ uri: getImageUri('small') }}
              style={styles.imageThumb}
              onLoadStart={() => setLoadingSmall(true)}
              onLoadEnd={() => setLoadingSmall(false)}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleChooseImage} style={styles.editBtn}>
          <MaterialIcons name={'edit'} color={'#000'} size={20} />
        </TouchableOpacity>
      </View>

      {/* Preview Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{item?.fieldtitle || 'Preview'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={{ width: '100%', height: 300 }}>
              {loadingLarge && (
                <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#000" />
              )}
              <Image
                source={{ uri: getImageUri('large') }}
                style={styles.modalImage}
                resizeMode="contain"
                onLoadStart={() => setLoadingLarge(true)}
                onLoadEnd={() => setLoadingLarge(false)}
              />
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
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  imageThumb: {
    borderWidth: 1,
    width: 100,
    height: 100,
    borderRadius: 80,
  },
  editBtn: {
    height: 36,
    width: 36,
    borderRadius: 36,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    left: Dimensions.get('screen').width / 2,
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
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  optionLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Media;
