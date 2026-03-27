import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { styles } from './style';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.8;

const ImageBottomSheetModal = ({
  visible,
  onClose,
  imageUrl,
}: any) => {
  const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const theme = useAppSelector(state => state?.theme.mode);
const { height, width } = useWindowDimensions();  
  const isLandscape = width > height;
  useEffect(() => {
    if (visible) {
      setShowModal(true);
      setLoading(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: MODAL_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  if (!showModal) return null;

  return (
    <Modal supportedOrientations={["portrait", "landscape"]} transparent animationType="none">
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.overlay,isLandscape && {
                alignContent:'center',
                alignItems:'center'
              }]}
        onPress={onClose}
      >
        <Animated.View
          style={[
            
            styles.container,
            { transform: [{ translateY }] },
            theme === 'dark' && {
              backgroundColor: 'black',
              borderWidth: 1,
              borderColor: 'white'
            },
            {
          width: isLandscape ? '50%' : '100%'
        },
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, 
           theme === 'dark' && {
              backgroundColor: 'white'
            }

          ]} />

          {/* Header */}
         

          {/* Image */}
          <View style={[styles.imageWrapper, 
             theme === 'dark' && {
              backgroundColor: 'black'
            }
          ]}>
            {loading && (
              <View style={[styles.loader,  theme === 'dark' && {
              backgroundColor: 'black'
            }]}>
                <ActivityIndicator size="large" color="#666" />
              </View>
            )}

            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ImageBottomSheetModal;
