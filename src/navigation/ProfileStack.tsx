import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import { ProfileStackParamList } from './types';
import { ERP_COLOR_CODE } from '../utils/constants';
import ProfileScreen from '../screens/dashboard/tabs/profile/ProfileScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: ERP_COLOR_CODE.ERP_ACTIVE_BACKGROUND,
        },
        headerTintColor: ERP_COLOR_CODE.ERP_WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false
      }}>
      <Stack.Screen
        name='Profile'
        component={ProfileScreen}
      />
      
    </Stack.Navigator>
  );
};

export default ProfileNavigator;