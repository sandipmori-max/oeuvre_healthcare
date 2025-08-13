import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import { AuthStackParamList } from './types';
import LoginScreen from '../screens/auth/login/LoginScreen';
import { ERP_COLOR_CODE } from '../utils/constants';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
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
        headerBackTitleVisible: false,
        headerShown: false
      }}>
      <Stack.Screen
        name='Login'
        component={LoginScreen}
      />
     
    </Stack.Navigator>
  );
};

export default AuthNavigator;