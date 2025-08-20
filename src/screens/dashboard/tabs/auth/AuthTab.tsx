import { Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ERP_ICON } from '../../../../assets';

const AuthTab = () => {
    const navigation = useNavigation<any>();
  

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <TouchableOpacity onPress={() => {}} style={{ marginRight: 12 }}>
            <Image
              source={ERP_ICON.REFRESH}
              style={{ width: 28, height: 32, tintColor: 'white' }}
              alt="Refresh Icon"
            />
          </TouchableOpacity>
        </>
      ),
      headerLeft: () => (
        <>
          <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ marginLeft: 12 }}>
            <Image
              source={ERP_ICON.MENU}
              style={{ width: 28, height: 32, tintColor: 'white' }}
              alt="Refresh Icon"
            />
          </TouchableOpacity>
        </>
      ),
    });
  }, [navigation]);
  return (
    <View>
      <Text>AuthTab</Text>
    </View>
  );
};

export default AuthTab;
