import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import SettingsScreen from '../screens/dashboard/settings/SettingsScreen';
import DrawerNavigator from './DrawerNavigator';
import TabNavigator from './TabNavigator';
import AttendanceScreen from '../screens/dashboard/attendance/AttendanceScreen';
import DisplayScreen from '../screens/dashboard/display/DisplayScreen';
import AlertScreen from '../screens/dashboard/alert/AlertScreen';
import PrivacyPolicyScreen from '../screens/dashboard/privacy/PrivacyPolicyScreen';
import WebScreen from '../screens/dashboard/web/WebScreen';
import ListScreen from '../screens/dashboard/list_page/ListScreen';
import PageScreen from '../screens/dashboard/page/Page';
import { Image } from 'react-native';
import { ERP_ICON } from '../assets';

const Stack = createStackNavigator<any>();

const StackNavigator = () => {
  const screenOptions = {
    headerShown: true,
    headerBackImage: () => (
      <Image
        source={ERP_ICON.BACK}
        style={{ width: 24, height: 24, marginLeft: 10, tintColor: 'white' }}
        resizeMode="contain"
      />
    ),
    headerStyle: {
      backgroundColor: '#251d50ff',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {},
      }}
    >
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen options={screenOptions} name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen options={screenOptions} name="Attendance" component={AttendanceScreen} />
      <Stack.Screen options={screenOptions} name="Display" component={DisplayScreen} />
      <Stack.Screen options={screenOptions} name="Alert" component={AlertScreen} />
      <Stack.Screen options={screenOptions} name="Privacy Policy" component={PrivacyPolicyScreen} />

      <Stack.Screen options={screenOptions} name="Web" component={WebScreen} />

      <Stack.Screen options={screenOptions} name="Page" component={PageScreen} />

      <Stack.Screen options={screenOptions} name="List" component={ListScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
