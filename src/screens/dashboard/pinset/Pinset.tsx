import MaterialIcons from '@react-native-vector-icons/material-icons';
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_COLOR, ERP_COLOR_CODE } from '../../../utils/constants';
import {
  getDBConnection,
  setPinCode,
  setPinEnabled,
  isPinEnabled,
  getPinCode,
  removePinCode,
  resetPin,
} from '../../../utils/sqlite';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../../../components/alert/CustomAlert';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setIsPinLoaded } from '../../../store/slices/auth/authSlice';

const { width } = Dimensions.get('screen');

// AsyncStorage keys for attempts/block
const AS_KEYS = {
  WRONG_ATTEMPTS: 'erp_pin_wrong_attempts',
  BLOCK_UNTIL: 'erp_pin_block_until',
};

const PinSetupScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.theme.mode);
  const [menuVisible, setMenuVisible] = useState(false);

  // PIN visual & stored
  const [pin, setPin] = useState<string>('');
  const [storedPin, setStoredPin] = useState<string>('');

  const [screen, setScreen] = useState<'verify' | 'setup' | 'confirm' | 'change_verify' | 'change_setup' | 'change_confirm' | 'remove_verify' | 'remove_confirm' | 'forgot_setup' | 'forgot_confirm' | 'blocked' | 'menu'>('menu');

  // temporary PIN holder for confirm flows
  const tempPinRef = useRef<string>('');

  // alerts
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  // attempts / block
  const [attempts, setAttempts] = useState<number>(0);
  const [blockUntil, setBlockUntil] = useState<number>(0);
  const [blockedLeft, setBlockedLeft] = useState(0);

  // load initial PIN + attempts + decide initial screen
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const db = await getDBConnection();
        const enabled = await isPinEnabled(db);
        if (enabled) {
          const oldPin = await getPinCode(db);
          setStoredPin(oldPin || '');
          setScreen('verify'); // keep original app behavior: ask user to verify to enter setup by default
        } else {
          setScreen('setup');
        }
      } catch (error) {
        console.error('Error checking PIN:', error);
      }

      // load attempts and blockUntil
      try {
        const attemptsStr = await AsyncStorage.getItem(AS_KEYS.WRONG_ATTEMPTS);
        const blockStr = await AsyncStorage.getItem(AS_KEYS.BLOCK_UNTIL);
        const a = attemptsStr ? Number(attemptsStr) : 0;
        const b = blockStr ? Number(blockStr) : 0;
        setAttempts(a);
        setBlockUntil(b);

        // if blocked and still within time -> set screen blocked
        if (b && Date.now() < b) {
          setScreen('blocked');
        }
      } catch (e) {
        console.warn('Error loading pin attempt data', e);
      }
    };
    bootstrap();
  }, []);
  useEffect(() => {
    if (screen !== 'blocked') return;

    const interval = setInterval(() => {
      if (!blockUntil) return;

      const left = Math.max(0, Math.ceil((blockUntil - Date.now()) / 1000));
      setBlockedLeft(left);

      if (left <= 0) {
        clearInterval(interval);
        // unblock automatically
        resetAttemptsAndBlock();
        setScreen(storedPin ? 'verify' : 'setup');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, blockUntil]);

  // header style kept as your original
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme === 'dark' ? 'black' : ERP_COLOR_CODE.ERP_APP_COLOR,
      },
      headerTintColor: '#fff',
      headerTitle: () => (
        <Text
          numberOfLines={1}
          style={{
            maxWidth: 180,
            fontSize: 18,
            fontWeight: '700',
            color: theme === 'dark' ? "white" : ERP_COLOR_CODE.ERP_WHITE,
          }}
        >
          {'Pinset'}
        </Text>
      ),
    });
  }, [navigation, theme]);

  useLayoutEffect(() => {
  navigation.setOptions({
    headerStyle: {
      backgroundColor: theme === 'dark' ? 'black' : ERP_COLOR_CODE.ERP_APP_COLOR,
    },
    headerTintColor: '#fff',
    headerTitle: () => (
      <Text
        numberOfLines={1}
        style={{
          maxWidth: 180,
          fontSize: 18,
          fontWeight: '700',
          color: theme === 'dark' ? "white" : ERP_COLOR_CODE.ERP_WHITE,
        }}
      >
        {'Pinset'}
      </Text>
    ),

    // ⭐ NEW — 3-dot menu icon
    headerRight: () => (
    <>
      {
        screen !== 'blocked' &&  <TouchableOpacity
        style={{ paddingHorizontal: 12 }}
        onPress={() => setMenuVisible(!menuVisible)}
      >
        <MaterialIcons name=  {menuVisible ? 'close' : "more-vert"} size={28} color="white" />
      </TouchableOpacity>
      }
     
    </>
    ),
  });
}, [navigation, theme,menuVisible, screen]);


  // helper: persist attempts & block
  const persistAttempts = async (count: number) => {
    setAttempts(count);
    try {
      await AsyncStorage.setItem(AS_KEYS.WRONG_ATTEMPTS, String(count));
    } catch (e) { console.warn('persistAttempts err', e); }
  };

  const persistBlockUntil = async (ts: number) => {
    setBlockUntil(ts);
    try {
      await AsyncStorage.setItem(AS_KEYS.BLOCK_UNTIL, String(ts));
    } catch (e) { console.warn('persistBlockUntil err', e); }
  };

  const resetAttemptsAndBlock = async () => {
    setAttempts(0);
    setBlockUntil(0);
    try {
      await AsyncStorage.removeItem(AS_KEYS.WRONG_ATTEMPTS);
      await AsyncStorage.removeItem(AS_KEYS.BLOCK_UNTIL);
    } catch (e) { console.warn('resetAttemptsAndBlock err', e); }
  };

  // PIN input handlers (keep existing keypad)
  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) setPin(pin + digit);
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  // helper: show alert using CustomAlert
  const showAlert = (title: string, message: string, type: 'error' | 'info' | 'success' = 'info', autoCloseMs?: number) => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
    if (autoCloseMs) {
      setTimeout(() => setAlertVisible(false), autoCloseMs);
    }
  };

  // check blocked state
  const isBlocked = () => {
    if (blockUntil && Date.now() < blockUntil) return true;
    return false;
  };

  // common verification failure handler (increments attempts, possible block)
  const handleWrongPin = async () => {
    const newAttempts = attempts + 1;
    await persistAttempts(newAttempts);

    if (newAttempts >= 3) {
      const until = Date.now() + 5 * 60 * 1000; // 5 minutes
      await persistBlockUntil(until);
      setScreen('blocked');
      showAlert('Blocked', 'Too many wrong attempts. Try again after 5 minutes.', 'error');
    } else {
      showAlert('Error', `Incorrect PIN (${newAttempts}/3)`, 'error', 1500);
    }
  };

  // When user confirms Remove PIN (after verification), call DB to remove
  const performRemovePin = async () => {
    try {
      const db = await getDBConnection();
      await resetPin(db);        // resets PIN meta + disables flag
      await removePinCode(db);  // remove code if exists
      await resetAttemptsAndBlock();

      showAlert('Success', 'PIN removed', 'success', 800);

      // update store and navigate back (same as original remove flow)
      dispatch(setIsPinLoaded());
      setTimeout(() => {
        setAlertVisible(false);
        navigation.goBack();
      }, 400);
    } catch (err) {
      console.error('performRemovePin err', err);
      showAlert('Error', 'Failed to remove PIN', 'error');
    }
  };

  // When user finishes setting a new PIN (setup or change or forgot)
  const performSavePin = async (finalPin: string, navigateBack = true) => {
    try {
      const db = await getDBConnection();
      await setPinCode(db, finalPin);
      await setPinEnabled(db, true);
      await resetAttemptsAndBlock();

      showAlert('Success', 'PIN setup done', 'success', 800);
      dispatch(setIsPinLoaded());

      // update local storedPin and maybe go back
      setStoredPin(finalPin);
      setPin('');

      if (navigateBack) {
        setTimeout(() => {
          setAlertVisible(false);
          navigation.goBack();
        }, 400);
      } else {
        // keep in-screen if you want (we'll go to menu)
        setScreen('menu');
      }
    } catch (error) {
      console.error('Error saving PIN:', error);
      showAlert('Error', 'Error saving PIN', 'error');
    }
  };

  // core OK button behavior — responds based on current screen
  const handleOk = async () => {
    // blocked check
    if (isBlocked()) {
      const leftSec = Math.ceil((blockUntil - Date.now()) / 1000);
      showAlert('Blocked', `Try again after ${leftSec} seconds`, 'error');
      setPin('');
      return;
    }

    if (pin.length !== 4) return; // ignore if not complete

    // ---------- INITIAL VERIFY (existing behavior) ----------
    if (screen === 'verify') {
      if (pin === storedPin) {
        await resetAttemptsAndBlock();
        showAlert('Success', 'Enter new PIN', 'success', 700);
        setPin('');
        setScreen('setup');
      } else {
        await handleWrongPin();
        setPin('');
      }
      return;
    }

    // ---------- SETUP (new PIN) ----------
    if (screen === 'setup') {
      // save to temp and go to confirm
      tempPinRef.current = pin;
      setPin('');
      setScreen('confirm');
      return;
    }
    if (screen === 'confirm') {
      if (pin === tempPinRef.current) {
        await performSavePin(pin, true); // navigate back as original did
      } else {
        showAlert('Error', 'PINs do not match', 'error');
        tempPinRef.current = '';
        setPin('');
        setScreen('setup');
      }
      return;
    }

    // ---------- CHANGE PIN flow ----------
    if (screen === 'change_verify') {
      if (pin === storedPin) {
        await resetAttemptsAndBlock();
        setPin('');
        setScreen('change_setup');
        showAlert('Success', 'Enter new PIN', 'success', 700);
      } else {
        await handleWrongPin();
        setPin('');
      }
      return;
    }
    if (screen === 'change_setup') {
      tempPinRef.current = pin;
      setPin('');
      setScreen('change_confirm');
      return;
    }
    if (screen === 'change_confirm') {
      if (pin === tempPinRef.current) {
        await performSavePin(pin, true); // save and go back
      } else {
        showAlert('Error', 'PINs do not match', 'error');
        tempPinRef.current = '';
        setPin('');
        setScreen('change_setup');
      }
      return;
    }

    // ---------- REMOVE PIN flow ----------
    if (screen === 'remove_verify') {
      if (pin === storedPin) {
        await resetAttemptsAndBlock();
        setPin('');
        setScreen('remove_confirm');
        showAlert('Success', 'Verified. Tap Remove to confirm', 'success', 700);
      } else {
        await handleWrongPin();
        setPin('');
      }
      return;
    }

    if (screen === 'remove_confirm') {
      // final remove
      await performRemovePin();
      return;
    }

    // ---------- FORGOT PIN flow (allow user to reset without old PIN after a prompt) ----------
    if (screen === 'forgot_setup') {
      tempPinRef.current = pin;
      setPin('');
      setScreen('forgot_confirm');
      return;
    }
    if (screen === 'forgot_confirm') {
      if (pin === tempPinRef.current) {
        // save new PIN
        await performSavePin(pin, true);
      } else {
        showAlert('Error', 'PINs do not match', 'error');
        tempPinRef.current = '';
        setPin('');
        setScreen('forgot_setup');
      }
      return;
    }

    // fallback: do nothing
  };

  // remove button pressed initially: we ask to verify before removal (preserve security)
  const onRemovePinPress = () => {
    if (!storedPin) {
      showAlert('Error', 'No PIN set', 'error');
      return;
    }
    setScreen('remove_verify');
    setPin('');
  };

  const onChangePinPress = () => {
    if (!storedPin) {
      // no pin yet -> go to setup
      setScreen('setup');
      setPin('');
      return;
    }
    setScreen('change_verify');
    setPin('');
  };

  const onForgotPinPress = () => {
    if (!storedPin) {
      showAlert('Info', 'No PIN set. Use Add PIN.', 'info');
      return;
    }
    // we will show a confirmation dialog to avoid accidental resets
    Alert.alert(
      'Forgot PIN',
      'Resetting PIN will remove the existing PIN and allow you to set a new one. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Reset',
          style: 'destructive',
          onPress: () => {
            // go to forgot flow (no old PIN verification)
            setScreen('forgot_setup');
            setPin('');
          }
        }
      ]
    );
  };

  const onCancel = () => {
    // behave like previous screen: if storedPin existed earlier, go to verify, else setup
    if (storedPin) {
      setScreen('verify');
    } else {
      setScreen('setup');
    }
    setPin('');
    tempPinRef.current = '';
  };

  // Small helper to show status text under title
  const renderSubtitle = () => {
    if (screen === 'verify') return 'Enter your current PIN to proceed';
    if (screen === 'setup') return 'Enter a 4-digit PIN to secure your account';
    if (screen === 'confirm') return 'Confirm your new PIN';
    if (screen === 'change_verify') return 'Enter your current PIN to change';
    if (screen === 'change_setup') return 'Enter new PIN';
    if (screen === 'change_confirm') return 'Confirm new PIN';
    if (screen === 'remove_verify') return 'Enter your PIN to remove it';
    if (screen === 'remove_confirm') return 'Tap OK to remove PIN';
    if (screen === 'forgot_setup') return 'Enter new PIN';
    if (screen === 'forgot_confirm') return 'Confirm new PIN';
    if (screen === 'blocked') {
      return `Too many attempts. Try again in ${blockedLeft} sec`;
    }

    return '';
  };

  return (
    <View style={[styles.container, theme === 'dark' && { backgroundColor: 'black' }]}>
      {/* Header */}
      <Text style={[styles.title, theme === 'dark' && { color: 'white' }]}>
        {(() => {
          if (screen === 'verify') return 'Verify your old PIN';
          if (screen === 'setup') return 'Set up new PIN';
          if (screen === 'confirm') return 'Confirm new PIN';
          if (screen === 'change_verify') return 'Change PIN - verify';
          if (screen === 'change_setup') return 'Change PIN - new';
          if (screen === 'change_confirm') return 'Change PIN - confirm';
          if (screen === 'remove_verify') return 'Remove PIN - verify';
          if (screen === 'remove_confirm') return 'Remove PIN - confirm';
          if (screen === 'forgot_setup') return 'Forgot PIN - new';
          if (screen === 'forgot_confirm') return 'Forgot PIN - confirm';
          if (screen === 'blocked') return 'Blocked';
          return storedPin ? 'PIN Settings' : 'Set up PIN';
        })()}
      </Text>

      <Text style={[styles.subtitle, theme === 'dark' && { color: 'white' }]}>
        {renderSubtitle()}
      </Text>

      {/* PIN Circles (same visual) */}
      <View style={styles.pinRow}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.pinCircle,
              {
                backgroundColor:
                  i < pin.length
                    ? theme === 'dark'
                      ? 'white'
                      : ERP_COLOR_CODE.ERP_APP_COLOR
                    : theme === 'dark'
                      ? DARK_COLOR
                      : '#e5e7eb',
              },
            ]}
          />
        ))}
      </View>

      {/* Keypad (same UI) */}
      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['del', '0', 'ok'],
        ].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map(key => (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={() => {
                  if (screen === 'blocked') return; // disabled while blocked
                  if (key === 'del') handleDelete();
                  else if (key === 'ok') handleOk();
                  else handleKeyPress(key);
                }}
              >
                {key === 'del' ? (
                  <MaterialIcons name="backspace" size={28} color="#374151" />
                ) : key === 'ok' ? (
                  <MaterialIcons
                    name="check-circle"
                    size={32}
                    color={pin.length === 4 ? '#16a34a' : '#9ca3af'}
                  />
                ) : (
                  <Text style={styles.keyText}>{key}</Text>
                )}
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
        onClose={() => {
          setAlertVisible(false);
        }}
        actionLoader={undefined}
      />

      {menuVisible && (
  <TouchableOpacity
    activeOpacity={1}
    onPress={() => setMenuVisible(false)}
    style={{
      position: 'absolute',
      top: 10,
      right: 10,
      width: 160,
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
      paddingVertical: 6,
      borderRadius: 10,
      elevation: 5,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
    }}
  >

    {/* Change PIN */}
    <TouchableOpacity
      onPress={() => {
        setMenuVisible(false);
        onChangePinPress();
      }}
      style={{ paddingVertical: 10, paddingHorizontal: 14 }}
    >
      <Text style={{ color: ERP_COLOR_CODE.ERP_APP_COLOR, fontSize: 15 }}>
        Change PIN
      </Text>
    </TouchableOpacity>

    {/* Remove PIN */}
    <TouchableOpacity
      onPress={() => {
        setMenuVisible(false);
        onRemovePinPress();
      }}
      style={{ paddingVertical: 10, paddingHorizontal: 14 }}
    >
      <Text style={{ color: '#dc2626', fontSize: 15 }}>Remove PIN</Text>
    </TouchableOpacity>


  </TouchableOpacity>
)}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    paddingTop: 32,
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
    textAlign: 'center',
    paddingHorizontal: 20,
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

export default PinSetupScreen;
