import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AttendanceScreen from '../screens/dashboard/attendance/AttendanceScreen';
import DisplayScreen from '../screens/dashboard/display/DisplayScreen';
import AlertScreen from '../screens/dashboard/alert/AlertScreen';
import PrivacyPolicyScreen from '../screens/dashboard/privacy/PrivacyPolicyScreen';
import TabNavigator from './TabNavigator';
import CustomDrawerContent from '../components/CustomDrawerContent';
import useTranslations from '../hooks/useTranslations';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { t } = useTranslations();
  return (
    <Drawer.Navigator initialRouteName="Home"
          drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={TabNavigator} options={{ title: t('navigation.home') }} />
      <Drawer.Screen name="Attendance" component={AttendanceScreen} options={{ title: t('navigation.attendance') }} />
      <Drawer.Screen name="Display" component={DisplayScreen} options={{ title: t('navigation.display') }} />
      <Drawer.Screen name="Alert" component={AlertScreen} options={{ title: t('navigation.alert') }} />
      <Drawer.Screen name="Privacy Policy" component={PrivacyPolicyScreen} options={{ title: t('navigation.privacyPolicy') }} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
