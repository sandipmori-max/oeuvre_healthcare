import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabIcon from '../components/TabIcon';
import { ERP_COLOR_CODE } from '../utils/constants';
import EntryTab from '../screens/dashboard/tabs/entry/EntryTab';
import ReportTab from '../screens/dashboard/tabs/report/ReportTab';
import ProfileNavigator from './ProfileStack';
import HomeScreen from '../screens/dashboard/tabs/home/HomeTab';
import AuthTab from '../screens/dashboard/auth/AuthTab';
import useTranslations from '../hooks/useTranslations';
import { useAppSelector } from '../store/hooks';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const theme = useAppSelector(state => state.theme);
  
  const { t } = useTranslations();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ERP_COLOR_CODE.ERP_BLACK,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? ERP_COLOR_CODE.ERP_BLACK : ERP_COLOR_CODE.ERP_WHITE,
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 80,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: ERP_COLOR_CODE.ERP_ACTIVE_BACKGROUND,
        },
        headerTintColor: ERP_COLOR_CODE.ERP_ACTIVE_BACKGROUND,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        
        options={{
          tabBarLabel: t('navigation.home'),
          title: t('navigation.home'),
          headerStyle: {
            backgroundColor: theme === 'dark' ? '#000' : ERP_COLOR_CODE.ERP_ACTIVE_BACKGROUND,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 8,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="home" color={color} size={size} focused={focused} />
          ),
        }}
      />
     <Tab.Screen
        name="Entry"
        component={EntryTab}
        options={{
          tabBarLabel: t('navigation.entry'),
          title: t('navigation.entry'),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 8,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="entry" color={color} size={size} focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Report"
        component={ReportTab}
        options={{
          tabBarLabel: t('navigation.report'),
          title: t('navigation.report'),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 8,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} name="report" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Auth"
        component={AuthTab}
        options={{
          tabBarLabel: t('navigation.auth'),
          title: t('navigation.auth'),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 8,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} name="auth" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          headerShown: false,
          tabBarLabel: t('navigation.profile'),
          title: t('navigation.profile'),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 8,
          },
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} name="profile" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
