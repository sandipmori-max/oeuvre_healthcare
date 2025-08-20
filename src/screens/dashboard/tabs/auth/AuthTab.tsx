import { Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ERP_ICON } from '../../../../assets';
import ERPIcon from '../../../../components/icon/ERPIcon';

const AuthTab = () => {
  const navigation = useNavigation<any>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
         <ERPIcon name="refresh" />
        </>
      ),
      headerLeft: () => (
        <>
           <ERPIcon extSize={24} isMenu={true} name="menu" onPress={() => navigation.openDrawer()} />
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
