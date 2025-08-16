import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { ERP_ICON } from '../../assets';
import { useAppSelector } from '../../store/hooks';
import { firstLetterUpperCase } from '../../utils/helpers';
import { ERP_DRAWER_LIST } from '../../constants';
import { styles } from './drawer_style';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const navigation = useNavigation();
  const { user } = useAppSelector(state => state?.auth);
  const currentRoute = props.state.routeNames[props.state.index];
    const theme = useAppSelector(state => state.theme);
  
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: theme === 'dark' ? 'black': 'white' }}>
      <View style={styles.header}>
        <Image source={ERP_ICON.APP_LOGO} style={styles.profileImage} />
        <Text style={styles.username}>{firstLetterUpperCase(user?.name || '')}</Text>
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
                <Text style={[styles.itemIcon, isActive && styles.activeText,
                  

                ]}>{item.icon}</Text>
                <Text style={[styles.itemLabel, isActive && styles.activeText , {
                  color: theme === 'dark' ? isActive ? '#000' : '#fff' : '#000',
                }]}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => {}}>
        <Text style={styles.logoutText}>DevERP</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
