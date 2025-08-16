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

const Stack = createStackNavigator<any>();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      }}
    >
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen
        options={{
          headerShown: true,
        }}
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen
        options={{
          headerShown: true,
        }}
        name="Attendance"
        component={AttendanceScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
        }}
        name="Display"
        component={DisplayScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
        }}
        name="Alert"
        component={AlertScreen}
      />
      <Stack.Screen
        options={{
          headerShown: true,
        }}
        name="Privacy Policy"
        component={PrivacyPolicyScreen}
      />

      <Stack.Screen
        options={{
          headerShown: true,
        }}
        name="Web"
        component={WebScreen}
      />

      <Stack.Screen
        options={{
          headerShown: true,
        }}
        name="Page"
        component={PageScreen}
      />

      <Stack.Screen
        options={{
          headerShown: true,
        }}
        name="List"
        component={ListScreen}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
