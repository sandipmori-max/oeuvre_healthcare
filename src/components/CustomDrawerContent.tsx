import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { ERP_ICON } from '../assets';
import { useAppSelector } from '../store/hooks';

type DrawerItemConfig = {
  label: string;
  route: string;
  icon?: string;
};

const drawerItems: DrawerItemConfig[] = [
  { label: 'Home', route: 'Home', icon: '🏠' },
  { label: 'Attendance', route: 'Attendance', icon: '📅' },
  { label: 'Display', route: 'Display', icon: '🖥️' },
  { label: 'Alert', route: 'Alert', icon: '🔔' },
  { label: 'Privacy Policy', route: 'Privacy Policy', icon: '📃' },
];

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const navigation = useNavigation();
  const {user} = useAppSelector(state => state?.auth);
  
  const currentRoute = props.state.routeNames[props.state.index];
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.header}>
        <Image
          source={ERP_ICON.APP_LOGO}
          style={styles.profileImage}
        />
        <Text style={styles.username}>{user?.name}</Text>
      </View>

      <View style={styles.menuContainer}>
        {drawerItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
          <TouchableOpacity
            key={item.route}
            style={[styles.drawerItem, isActive && styles.activeItemBackground]}
            onPress={() => navigation.navigate(item.route as never)}
          >
            <View style={styles.itemRow}>
              <Text style={[styles.itemIcon, isActive && styles.activeText]}>
                {item.icon}
              </Text>
              <Text style={[styles.itemLabel, isActive && styles.activeText]}>
                {item.label}
              </Text>
            </View>
          </TouchableOpacity>

          );
        })}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
        }}
      >
        <Text style={styles.logoutText}>DevERP</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#000',
  },
  username: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8
  },
  itemIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  drawerItem: {
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 6
  },
  activeItemBackground: {
    backgroundColor: '#e6f0ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    borderRadius: 8,
  },
  logoutButton: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  logoutText: {
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;
