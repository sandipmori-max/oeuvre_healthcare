
import React from 'react';
import {
  View,
} from 'react-native';
import useKeyboardVisible from '../hooks/useKeyboardVisible';

const KeyboardAwareWrapper  = ({}) => {
  const keyboardVisible = useKeyboardVisible();

  return (
    <View style={{
        paddingBottom : keyboardVisible ? 340 : 0
    }}/>
  );
};

export default KeyboardAwareWrapper;

