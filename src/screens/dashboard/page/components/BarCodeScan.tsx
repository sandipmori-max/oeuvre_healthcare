import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  BackHandler,
  StyleSheet,
} from 'react-native';
 
import { RESULTS } from 'react-native-permissions';
import { usePermissions } from '../../../../permissions/usePermissions';
import { EPermissionTypes } from '../../../../constants';
import { goToSettings } from '../../../../utils/helpers';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { useAppSelector } from '../../../../store/hooks';
import { BarCodeCameraScanner } from '../../../../components/CameraScanner/BarCodeCameraScanner';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const BarCodeScan = ({ item }: any) => {
  const { askPermissions } = usePermissions(EPermissionTypes.CAMERA);
  const [cameraShown, setCameraShown] = useState(false);
  const [scannedValue, setScannedValue] = useState('');
  const theme = useAppSelector(state => state?.theme.mode);

  // Handle Back Button
  function handleBackButtonClick() {
    if (cameraShown) {
      setCameraShown(false);
      return true;
    }
    return false;
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    return () => {
      // BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, [cameraShown]);

  // Permission Handler
  const takePermissions = async () => {
    askPermissions()
      .then(response => {
        if (response.type === RESULTS.LIMITED || response.type === RESULTS.GRANTED) {
          setCameraShown(true);
        }
      })
      .catch(error => {
        if ('isError' in error && error.isError) {
          Alert.alert(
            error.errorMessage ||
            'Something went wrong while taking camera permission',
          );
        }

        if ('type' in error) {
          if (error.type === RESULTS.UNAVAILABLE) {
            Alert.alert('This feature is not supported on this device');
          } else if (error.type === RESULTS.BLOCKED || error.type === RESULTS.DENIED) {
            Alert.alert(
              'Permission Denied',
              'Please give permission from settings to continue using camera.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Go To Settings', onPress: () => goToSettings() },
              ],
            );
          }
        }
      });
  };

  // Scanner Callback
  const handleReadCode = (value: string) => {
    setScannedValue(value);
    setCameraShown(false);
  };

  return (
    <View style={{ paddingVertical: 10 }}>
      
      {/* Title */}
      <Text style={[styles.label, theme === 'dark' && { color: 'white' }]}>
        {item?.fieldtitle}
      </Text>

      {/* Tooltip */}
      {item?.tooltip !== item?.fieldtitle && (
        <Text style={[styles.subLabel, theme === 'dark' && { color: 'white' }]}>
          {item?.tooltip}
        </Text>
      )}

      {/* Mandatory */}
      {item?.mandatory === '1' && (
        <Text style={{ color: ERP_COLOR_CODE.ERP_ERROR }}>*</Text>
      )}

      {/* Main UI Area */}
      <View style={[cameraShown && styles.container ]}>
        
        {/* Scan Button */}
        {!cameraShown && (
          <TouchableOpacity
  onPress={takePermissions}
  activeOpacity={0.8}
  style={styles.squareScanCard}
>
  <MaterialIcons name="barcode-reader" size={42} color={ERP_COLOR_CODE.ERP_APP_COLOR} />
  <Text style={styles.squareScanText}>Scan Barcode</Text>
</TouchableOpacity>

        )}

        {/* Scan Result */}
        {scannedValue !== '' && !cameraShown && (
          <View style={styles.resultBox}>
            <MaterialIcons name="check-circle" size={20} color="green" />
            <Text style={styles.resultText}>Scanned: {scannedValue}</Text>
          </View>
        )}

        {/* Camera */}
        {cameraShown && (
          <BarCodeCameraScanner
            setIsCameraShown={setCameraShown}
            onReadCode={handleReadCode}
          />
        )}
      </View>
    </View>
  );
};

export default BarCodeScan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 15,
    color: ERP_COLOR_CODE.ERP_333,
    fontWeight: '700',
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 13,
    color: ERP_COLOR_CODE.ERP_333,
    opacity: 0.8,
    marginBottom: 8,
  },

  // Scan Button
  scanButton: {
    width: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 10,
     flexDirection: 'row',
     padding:12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultText: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '600',
  },
  squareScanCard: {
  width: "100%",
  aspectRatio: 2.8,
  borderRadius: 12,
   borderWidth: 1.5,
  borderColor: ERP_COLOR_CODE.ERP_999,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 10,
},
squareScanText: {
  marginTop: 10,
  fontSize: 16,
  fontWeight: "600",
  color: ERP_COLOR_CODE.ERP_APP_COLOR,
},

});
