import React, { useEffect, useRef } from 'react';
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from 'react-native';
import { styles } from '../page_style';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import { useAppSelector } from '../../../../store/hooks';
import useTranslations from '../../../../hooks/useTranslations';

const ErrorModal = ({
  visible,
  errors,
  onClose,
}: {
  visible: boolean;
  errors: string[];
  onClose: () => void;
}) => {
  const theme = useAppSelector(state => state?.theme.mode);
  const { t } = useTranslations();

  /** Modal animation */
  const translateY = useRef(new Animated.Value(300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  /** FlatList item animations (stable ref) */
  const itemAnimationsRef = useRef<Animated.Value[]>([]);

  // Ensure animations array matches errors length
  if (itemAnimationsRef.current.length !== errors.length) {
    itemAnimationsRef.current = errors.map(
      (_, i) => itemAnimationsRef.current[i] || new Animated.Value(0)
    );
  }

  useEffect(() => {
    if (visible) {
      // reset values
      itemAnimationsRef.current.forEach(anim => anim.setValue(0));

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.stagger(
          80,
          itemAnimationsRef.current.map(anim =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 250,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            })
          )
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 340,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, errors]);

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const anim = itemAnimationsRef.current[index];

    return (
      <Animated.Text
        style={[
          styles.errorText,
          {
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          },
        ]}
      >
        • {item}
      </Animated.Text>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Animated.View
          style={[
            styles.bottomSheet,
            theme === 'dark' && {
              backgroundColor: 'black',
              borderWidth: 1,
              borderColor: 'white',
            },
            { transform: [{ translateY }] },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center', 
            }}
          >
            <Text
              style={[
                styles.title,
                theme === 'dark' && { color: 'white' },
              ]}
            >
              {t('text.text35')}-
            </Text>
            <TouchableOpacity style={{ 
              justifyContent:'center',
              alignItems: 'center',
              alignContent:'center',
              alignSelf:'center',
              height: 32, width: 32,}} onPress={onClose}>
              <MaterialIcons
                name="close"
                size={20}
                color={ERP_COLOR_CODE.ERP_555}
              />
            </TouchableOpacity>
          </View>

          <View style={{ marginVertical: 14 }}>
            <FlatList
              data={errors}
              keyExtractor={(_, index) => index.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={renderItem}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default ErrorModal;
