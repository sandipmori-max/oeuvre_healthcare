import React, { useRef, useEffect } from 'react';
import { 
  Animated, 
} from 'react-native';
import { ERP_COLOR_CODE } from '../../utils/constants';
import { useAppSelector } from '../../store/hooks';
import TranslatedText from '../../screens/dashboard/tabs/home/TranslatedText';
import { styles } from './style';


const Toast = ({ visible, message, onHide , tbackgroundColor, textColor}: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const theme = useAppSelector(state => state.theme.mode);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(onHide);
        }, 900);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        theme === 'dark' && {
          backgroundColor: "white",
        },
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        },
        {
          backgroundColor: tbackgroundColor ? tbackgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR
        }
      ]}
    >
      <TranslatedText
      text={message}
      numberOfLines={1}
      style={[
        styles.toastText,
         
        theme === 'dark' && { color: 'black' },
        {
          color: textColor
        }
      ]}>
        
      </TranslatedText>
    </Animated.View>
  );
};

export default Toast;
