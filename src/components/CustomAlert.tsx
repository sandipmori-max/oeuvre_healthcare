import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { ERP_GIF } from '../assets';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
}

const getGifSource = (type: 'error' | 'success' | 'info') => {
  switch (type) {
    case 'error':
      return ERP_GIF.ERROR;
    case 'success':
      return ERP_GIF.SUCCESS; 
    default:
      return ERP_GIF.SEARCH_LOADER;
  }
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
}) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: styles.errorContainer,
          title: styles.errorTitle,
          message: styles.errorMessage,
        };
      case 'success':
        return {
          container: styles.successContainer,
          title: styles.successTitle,
          message: styles.successMessage,
        };
      default:
        return {
          container: styles.infoContainer,
          title: styles.infoTitle,
          message: styles.infoMessage,
        };
    }
  };

  const alertStyles = getAlertStyles();
  const gifSource = getGifSource(type);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.bottomSheet, alertStyles.container]}>
          <View style={styles.header}>
            <Text style={alertStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FastImage
            source={gifSource}
            style={styles.gif}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={alertStyles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 220,
    maxHeight: 340,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  closeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  gif: {
    width: 120,
    height: 120,
    marginBottom: 6,
  },
  errorContainer: {
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  // Success styles
  successContainer: {
    backgroundColor: '#fff',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  // Info styles
  infoContainer: {
    backgroundColor: '#fff',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  infoMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default CustomAlert;