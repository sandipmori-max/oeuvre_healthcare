
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  View,
  StyleSheet, 
} from 'react-native';

 

const KeyboardAwareWrapper  = ({
  
}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View style={{
        paddingBottom : keyboardVisible ? 340 : 0
    }}/>
  );
};

export default KeyboardAwareWrapper;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
