import MaterialIcons from '@react-native-vector-icons/material-icons';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { ERP_COLOR_CODE } from '../../../../utils/constants';

const SignaturePad: React.FC = ({ item, handleSignatureAttachment }: any) => {
  const signatureRef = useRef<SignatureViewRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  // Called when user saves signature
  const handleSignature = (signature: string) => {
    setSavedSignature(signature); // save for preview
    handleSignatureAttachment(`${item?.field}.jpeg; ${signature}`, item?.field);
    setModalVisible(false);
    setHasSignature(false);
  };

  // Clear signature
  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
    setSavedSignature(null);
  };

  // Save signature manually
  const handleSave = () => {
    signatureRef.current?.readSignature();
  };

  return (
    <View style={styles.container}>
      <Text style={{ marginVertical: 8, fontWeight: '600' }}>{item?.fieldtitle}</Text>

      <TouchableOpacity
        style={savedSignature ? styles.savedSignatureContainer : styles.openButton}
        onPress={() => setModalVisible(true)}
      >
        {savedSignature ? (
          <Image
            source={{ uri: savedSignature }}
            style={styles.savedSignature}
            resizeMode="contain"
          />
        ) : (
          <>
            <MaterialIcons name="edit" size={18} color="#000" />
            <Text style={styles.openButtonText}>Add signature</Text>
          </>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <View style={styles.bottomSheet}>
          <View
            style={{
              alignContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              marginBottom: 10,
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.modalTitle}>Sign below</Text>
            <View style={styles.buttonOverlay}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <MaterialIcons name="save" size={18} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClear}>
                <MaterialIcons name="auto-fix-high" size={18} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.signatureBox}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={() => Alert.alert('Please provide a signature')}
              onBegin={() => setHasSignature(true)}
              descriptionText="Sign here"
              clearText="Clear"
              confirmText="Save"
              autoClear={false}
              dataURL={savedSignature || undefined}
              webStyle={`
                .m-signature-pad--footer {display: none; margin: 0;}
                .m-signature-pad {box-shadow: none; border: none;}
              `}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SignaturePad;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 12,
    backgroundColor: '#F8F9FA',
  },
  openButton: {
    flexDirection: 'row',
    width: '100%',
    height: 68,
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 0.5,
    borderRadius: 8,
    justifyContent: 'center',
  },
  openButtonText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '600',
  },
  savedSignatureContainer: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  savedSignature: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    height: Dimensions.get('window').height / 2.5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
  },
  buttonOverlay: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-around',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  saveButton: {
    borderColor: '#ccc',
    borderWidth: 1,

  },
  clearButton: { borderColor: '#ccc',
    borderWidth: 1,

   },
  closeButton: { borderColor: '#ccc',
    borderWidth: 1,

   },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '600',
  },
});
