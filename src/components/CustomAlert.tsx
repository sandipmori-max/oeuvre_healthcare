import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
}

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
          closeButton: styles.errorCloseButton,
          closeText: styles.errorCloseText,
        };
      case 'success':
        return {
          container: styles.successContainer,
          title: styles.successTitle,
          message: styles.successMessage,
          closeButton: styles.successCloseButton,
          closeText: styles.successCloseText,
        };
      default:
        return {
          container: styles.infoContainer,
          title: styles.infoTitle,
          message: styles.infoMessage,
          closeButton: styles.infoCloseButton,
          closeText: styles.infoCloseText,
        };
    }
  };

  const alertStyles = getAlertStyles();

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
          <Text style={alertStyles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

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
    minHeight: 200,
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  // Error styles
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
  },
  errorCloseButton: {
    backgroundColor: '#dc3545',
  },
  errorCloseText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Success styles
  successContainer: {
    backgroundColor: '#fff',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  successCloseButton: {
    backgroundColor: '#28a745',
  },
  successCloseText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
  },
  infoCloseButton: {
    backgroundColor: '#007bff',
  },
  infoCloseText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CustomAlert;
