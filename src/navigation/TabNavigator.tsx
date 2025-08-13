import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import TabIcon from '../components/TabIcon';
import { ERP_COLOR_CODE } from '../utils/constants';
import EntryTab from '../screens/dashboard/tabs/entry/EntryTab';
import ReportTab from '../screens/dashboard/tabs/report/ReportTab';
import ProfileNavigator from './ProfileStack';
import HomeScreen from '../screens/dashboard/tabs/home/HomeTab';
import AuthTab from '../screens/dashboard/auth/AuthTab';
import useTranslations from '../hooks/useTranslations';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useTranslations();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ERP_COLOR_CODE.ERP_BLACK,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor:  ERP_COLOR_CODE.ERP_ACTIVE_BACKGROUND,
        },
        headerTintColor:  ERP_COLOR_CODE.ERP_ACTIVE_BACKGROUND,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('navigation.home'),
          title: t('navigation.home'),
          tabBarIcon: ({color, size}) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Entry"
        component={EntryTab}
        options={{
          tabBarLabel: t('navigation.entry'),
          title: t('navigation.entry'),
          tabBarIcon: ({color, size}) => (
            <TabIcon name="entry" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportTab}
        options={{
          tabBarLabel: t('navigation.report'),
          title: t('navigation.report'),
          tabBarIcon: ({color, size}) => (
            <TabIcon name="report" color={color} size={size} />
          ),
        }}
      />
       <Tab.Screen
        name="Auth"
        component={AuthTab}
        options={{
          tabBarLabel: t('navigation.auth'),
          title: t('navigation.auth'),
          tabBarIcon: ({color, size}) => (
            <TabIcon name="auth" color={color} size={size} />
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
          tabBarIcon: ({color, size}) => (
            <TabIcon name="profile" color={color} size={size} />
          ),
        }}
      />
     
      
   
    </Tab.Navigator>
  );
};

export default TabNavigator;