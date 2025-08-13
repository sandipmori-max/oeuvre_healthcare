import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import FastImage from 'react-native-fast-image';

import { CustomAlertProps } from '../types';
import { getGifSource } from '../../utils/helpers';
import { styles } from './custom_alert_style';


 const getAlertStyles = (type: string) => {
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

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
}) => {

  const alertStyles = getAlertStyles(type);
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

export default CustomAlert;