import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import FastImage from 'react-native-fast-image';

import { CustomAlertProps } from '../types';
import { getGifSource } from '../../utils/helpers';
import { styles } from './custom_alert_style';
import { getAlertStyles } from './helper';

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  onDone,
  onCancel,
  doneText = 'Done',
  cancelText = 'Cancel',
}) => {
  const alertStyles = getAlertStyles(type);
  const gifSource = getGifSource(type);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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

          {(onDone || onCancel) && (
            <View style={styles.buttonRow}>
              {onCancel && (
                <TouchableOpacity style={styles.buttonCancel} onPress={onCancel}>
                  <Text style={styles.buttonText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              {onDone && (
                <TouchableOpacity style={styles.button} onPress={onDone}>
                  <Text style={styles.buttonText}>{doneText}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
