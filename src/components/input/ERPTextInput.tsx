import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ERPTextInputProps } from '../types';
import { styles } from '../../screens/auth/login/login_style';

const ERPTextInput: React.FC<ERPTextInputProps> = ({
  label,
  error,
  touched,
  helperText,
  secureTextEntry,
  showToggle = false,
  icon,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  helperStyle,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      {label ? <Text style={[styles.inputLabel, labelStyle]}>{label}</Text> : null}
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          style={[
            styles.input,
            inputStyle,
            { paddingRight: showToggle && secureTextEntry ? 36 : 12 },
          ]}
          secureTextEntry={secureTextEntry && !showPassword}
          {...rest}
        />
        {showToggle && secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(s => !s)}
            style={{
              position: 'absolute',
              right: 8,
              top: 0,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Text style={{ fontSize: 18 }}>{showPassword ? '🚫' : '👁️'}</Text>
          </TouchableOpacity>
        )}
        {icon}
      </View>
      {helperText && !error && <Text style={[styles.helperText, helperStyle]}>{helperText}</Text>}
      {touched && !!error && <Text style={[styles.errorText, errorStyle]}>{error}</Text>}
    </View>
  );
};

export default ERPTextInput;
