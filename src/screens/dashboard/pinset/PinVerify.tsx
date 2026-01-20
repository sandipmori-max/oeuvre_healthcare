import MaterialIcons from '@react-native-vector-icons/material-icons';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  NativeModules,
} from 'react-native';
import { ERP_COLOR_CODE } from '../../../utils/constants';
import { getDBConnection, getPinCode } from '../../../utils/sqlite';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../../../components/alert/CustomAlert';

const { width } = Dimensions.get('screen');

const PinVerifyScreen = () => {
  const [pin, setPin] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  const navigation = useNavigation<any>();

  // Each key has its own scale value
  const keyScales = useRef<{ [key: string]: Animated.Value }>({}).current;

  const getScale = (key: string) => {
    if (!keyScales[key]) keyScales[key] = new Animated.Value(1);
    return keyScales[key];
  };

  const animateKey = (key: string) => {
    const scale = getScale(key);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Optional: sound function (requires native setup)
  const playTapSound = () => {
    if (Platform.OS === 'ios') {
      const { AudioServices } = NativeModules;
      AudioServices?.playSystemSound?.(1104);
    } else if (Platform.OS === 'android') {
      const { SoundModule } = NativeModules;
      SoundModule?.playTap?.();
    }
  };

  const handleKeyPress = (digit: string) => {
    if (!isBlocked && pin.length < 4) {
      setPin(pin + digit);
      animateKey(digit);
      playTapSound();
    }
  };

  const handleDelete = () => {
    if (!isBlocked) {
      setPin(pin.slice(0, -1));
      animateKey('del');
      playTapSound();
    }
  };

  const blockUser = () => {
    setIsBlocked(true);
    setCountdown(60);
    setAttempts(0);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsBlocked(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyPin = async () => {
    if (isBlocked) return;

    if (pin.length < 4) {
      setAlertVisible(true);
      setAlertConfig({
        title: 'Error',
        message: 'Enter 4-digit PIN',
        type: 'error',
      });
      return;
    }

    try {
      const db = await getDBConnection();
      const savedPin = await getPinCode(db);

      if (savedPin === pin) {
        navigation.replace('Drawer');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        setAlertVisible(true);
        setAlertConfig({
          title: 'Error',
          message: 'Incorrect PIN, try again',
          type: 'error',
        });
        setPin('');

        animateKey('ok'); // optional animation on wrong OK press

        if (newAttempts >= 3) {
          blockUser();
        }
      }
    } catch (error) {
      setAlertVisible(true);
      setAlertConfig({
        title: 'Error verifying PIN',
        message: error?.toString() || '',
        type: 'error',
      });
    }
  };

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['del', '0', 'ok'],
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Enter PIN</Text>
      <Text style={styles.subtitle}>Enter your 4-digit PIN to continue</Text>

      {/* Countdown if blocked */}
      {isBlocked && (
        <Text
          style={{
            color: 'red',
            fontSize: 16,
            marginBottom: 20,
            paddingHorizontal: 30,
            textAlign: 'center',
          }}
        >
          Too many wrong attempts.{'\n'}Try again in {countdown} seconds
        </Text>
      )}

      {/* PIN Circles */}
      <View style={styles.pinRow}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.pinCircle,
              { backgroundColor: i < pin.length ? ERP_COLOR_CODE.ERP_APP_COLOR : '#e5e7eb' },
            ]}
          />
        ))}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {keypadRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map(key => (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={() => {
                  if (isBlocked) return;
                  if (key === 'del') handleDelete();
                  else if (key === 'ok') handleVerifyPin();
                  else handleKeyPress(key);
                }}
              >
                <Animated.View style={{ transform: [{ scale: getScale(key) }] }}>
                  {key === 'del' ? (
                    <MaterialIcons name="backspace" size={28} color="#374151" />
                  ) : key === 'ok' ? (
                    <MaterialIcons
                      name="check-circle"
                      size={36}
                      color={pin.length === 4 ? '#16a34a' : '#9ca3af'}
                    />
                  ) : (
                    <Text style={styles.keyText}>{key}</Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
        actionLoader={undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 40,
  },
  pinRow: {
    flexDirection: 'row',
    marginBottom: 50,
  },
  pinCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginHorizontal: 8,
  },
  keypad: {
    width: width * 0.8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
  },
});

export default PinVerifyScreen;
