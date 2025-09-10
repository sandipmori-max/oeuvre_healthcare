import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Platform,
  FlatList,
  Keyboard,
  Dimensions,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ERPIcon from '../../../components/icon/ERPIcon';
import { ERP_ICON } from '../../../assets';

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const [editMode, setEditMode] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentImageField, setCurrentImageField] = useState('');

  const [profile, setProfile] = useState({
    username: 'sandip123',
    fullname: 'Sandip Kumar',
    role: 'Software Engineer',
    reportingTo: 'Manager Name',
    address: '123 Street Name\nCity, State, Zip',
    mobile: '+91 9876543210',
    email: 'sandip@example.com',
    singleSearch: false,
    profileImage: null,
    signatureImage: null,
  });

  const requestPermission = async (type: 'camera' | 'gallery') => {
    const permission =
      Platform.OS === 'android'
        ? type === 'camera'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : type === 'camera'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.IOS.PHOTO_LIBRARY;

    const result = await check(permission);
    if (result === RESULTS.GRANTED) return true;

    const req = await request(permission);
    return req === RESULTS.GRANTED;
  };

  const pickImage = async (field: string, from: 'camera' | 'gallery') => {
    let granted = await requestPermission(from);
    if (!granted) return;

    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      includeBase64: false,
    };

    const response =
      from === 'camera' ? await launchCamera(options) : await launchImageLibrary(options);

    if (response.assets && response.assets.length > 0) {
      const image: Asset = response.assets[0];
      setProfile({ ...profile, [field]: image.uri || null });
    }

    setImageModalVisible(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text
          numberOfLines={1}
          style={{ maxWidth: 180, fontSize: 18, fontWeight: '700', color: '#fff' }}
        >
          Profile Details
        </Text>
      ),

      headerRight: () => (
        <>
          <ERPIcon name={editMode ? 'save' : 'edit'} onPress={() => {}} />

          <ERPIcon
            // isLoading={actionLoader}
            name="refresh"
            // onPress={() => {
            //   setRefresh(!refresh);
            //   setActionLoader(!actionLoader);
            // }}
          />
        </>
      ),
    });
  }, [navigation, editMode]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 16 }}>
      <FlatList
        data={['']}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: keyboardHeight }}
        keyboardShouldPersistTaps="handled"
        renderItem={() => {
          return (
            <>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <View style={styles.imageWrapper}>
                  <TouchableOpacity
                    onPress={() => {
                      if (editMode) {
                        setCurrentImageField('profileImage');
                        setImageModalVisible(true);
                      }
                    }}
                  >
                    <View style={{ width: 100, height: 100 }}>
                      {profile.profileImage ? (
                        <Image
                          source={{ uri: profile.profileImage }}
                          style={styles.imageThumb}
                          resizeMode="contain"
                        />
                      ) : (
                        <Image
                          source={ERP_ICON.APP_LOGO}
                          style={styles.imageThumb}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      if (editMode) {
                        setCurrentImageField('profileImage');
                        setImageModalVisible(true);
                      }
                    }}
                    style={styles.editBtn}
                  >
                    <MaterialIcons name={'edit'} color={'#000'} size={20} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.fullName}>{profile.fullname}</Text>
                <Text style={styles.role}>{profile.role}</Text>
              </View>

              {renderField('User Name', 'username', profile, setProfile, editMode)}
              {renderField('Full Name', 'fullname', profile, setProfile, editMode)}
              {renderField('Role Name', 'role', profile, setProfile, editMode)}
              {renderField('Reporting To', 'reportingTo', profile, setProfile, editMode)}
              {renderField('Address', 'address', profile, setProfile, editMode, true)}
              {renderField('Mobile No', 'mobile', profile, setProfile, editMode)}
              {renderField('Email ID', 'email', profile, setProfile, editMode)}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
                <CustomCheckbox
                  value={profile.singleSearch}
                  onValueChange={val => setProfile({ ...profile, singleSearch: val })}
                  disabled={!editMode}
                />
                <Text style={{ marginLeft: 8, color: '#374151', fontSize: 16 }}>
                  Single Search in Mobile App
                </Text>
              </View>

              <Text style={styles.label}>Signature</Text>
              <TouchableOpacity
                onPress={() => {
                  if (editMode) {
                    setCurrentImageField('signatureImage');
                    setImageModalVisible(true);
                  }
                }}
              >
                {profile.signatureImage ? (
                  <Image source={{ uri: profile.signatureImage }} style={styles.signature} />
                ) : (
                  <View style={styles.signaturePlaceholder}>
                    <MaterialIcons name="edit" size={28} color="#666" />
                    <Text style={{ color: '#666' }}>Tap to upload signature</Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          );
        }}
      />

      <Modal visible={imageModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage(currentImageField, 'camera')}
            >
              <MaterialIcons name="photo-camera" size={24} color="#2563eb" />
              <Text style={styles.modalText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage(currentImageField, 'gallery')}
            >
              <MaterialIcons name="photo-library" size={24} color="#2563eb" />
              <Text style={styles.modalText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { borderTopWidth: 0.5 }]}
              onPress={() => setImageModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#dc2626" />
              <Text style={[styles.modalText, { color: '#dc2626' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function renderField(
  label,
  field,
  profile,
  setProfile,
  editMode,
  multiline = false
) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.label}>{label}</Text>
      {editMode ? (
        <TextInput
          value={profile[field]}
          onChangeText={(val) => setProfile({ ...profile, [field]: val })}
          style={styles.input}
          multiline={multiline}
          placeholder={`Enter ${label}`}      
          placeholderTextColor="#9ca3af"       
        />
      ) : (
        <Text style={styles.value}>{profile[field]}</Text>
      )}
    </View>
  );
}


function CustomCheckbox({
  value,
  onValueChange,
  disabled,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange(!value)}
      style={{
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: value ? '#2563eb' : '#9ca3af',
        borderRadius: 6,
        backgroundColor: value ? '#2563eb' : '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {value && <MaterialIcons name="check" size={16} color="#fff" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  imageWrapper: {
    width: '100%',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullName: { marginTop: 8, fontSize: 18, fontWeight: '600' },
  role: { color: '#6b7280' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
  },
  value: { fontSize: 16, color: '#111827' },
  signature: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  signaturePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 12,
  },
  modalButton: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  modalText: { marginLeft: 12, fontSize: 16, fontWeight: '500', color: '#374151' },
});
