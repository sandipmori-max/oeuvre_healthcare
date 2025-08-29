import MaterialIcons from '@react-native-vector-icons/material-icons';
import React, { useState } from 'react';
import { View, Image, Dimensions, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const Media = ({ item, handleAttachment }: any) => {
  console.log('🚀 ~ Media ~ item:', item);
  const [imageUri, setImageUri] = useState<string | null>(null);

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

  const handleChooseImage = async () => {
    Alert.alert('Select Image', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const granted = await requestPermission('camera');
          if (!granted) return Alert.alert('Permission denied', 'Camera access is required');
          launchCamera(
            { mediaType: 'photo', quality: 0.8, includeBase64: true },
            response => {
              if (response.assets && response.assets.length > 0) {
                const asset: Asset = response.assets[0];
                setImageUri(asset.uri || null);
                handleAttachment(`data:${asset.type};base64,${asset.base64}`, item.field);
              }
            },
          );
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const granted = await requestPermission('gallery');
          if (!granted) return Alert.alert('Permission denied', 'Gallery access is required');
          launchImageLibrary(
            { mediaType: 'photo', quality: 0.8, includeBase64: true },
            response => {
              if (response.assets && response.assets.length > 0) {
                const asset: Asset = response.assets[0];
                setImageUri(asset.uri || null);
                handleAttachment(`data:${asset.type};base64,${asset.base64}`, item.field);
              }
            },
          );
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <>
      <Text
        style={{
          fontWeight: '600',
          marginBottom: 4,
        }}
      >
        {item?.fieldtitle}
      </Text>
      <View
        style={{
          width: '100%',
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: 4,
        }}
      >
        <Image
          key={item.field}
          source={{
            uri: imageUri || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600',
          }}
          style={{ borderWidth: 1, width: 100, height: 100, borderRadius: 80 }}
        />
        <TouchableOpacity
          onPress={handleChooseImage}
          style={{
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
          }}
        >
          <MaterialIcons name={'edit'} color={'#000'} size={20} />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default Media;
