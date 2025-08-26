import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';

import { useAppSelector } from '../../store/hooks';
import { firstLetterUpperCase } from '../../utils/helpers';
import { ERP_DRAWER_LIST } from '../../constants';
import { styles } from './drawer_style';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const navigation = useNavigation();

  const { user } = useAppSelector(state => state?.auth);
  const theme = useAppSelector(state => state.theme);

  const currentRoute = props.state.routeNames[props.state.index];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, backgroundColor: theme === 'dark' ? 'black' : 'white' }}
    >
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600' }}
          style={styles.profileImage}
        />
        <Text style={styles.username}>{firstLetterUpperCase(user?.name || '')}</Text>
        <Text style={styles.userPhone}>+91 987654321</Text>
      </View>

      <View style={styles.menuContainer}>
        {ERP_DRAWER_LIST.map(item => {
          const isActive = currentRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.drawerItem, isActive && styles.activeItemBackground]}
              onPress={() => {
                if (item.route === 'Home') {
                  props.navigation.navigate('Home', { screen: 'Home' });
                  props.navigation.closeDrawer();
                  return;
                } else {
                  props.navigation.closeDrawer();
                  navigation.navigate(item.route as never);
                }
              }}
            >
              <View style={styles.itemRow}>
                <MaterialIcons name={`${item.icon}`} color={isActive ? '#fff' : '#000'} size={20} />
                <Text
                  style={[
                    styles.itemLabel,
                    isActive && styles.activeText,
                    {
                      color: isActive ? '#fff' : '#000',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.logoutButton}>
        <Text style={styles.logoutText}>DevERP Mobile app</Text>
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
