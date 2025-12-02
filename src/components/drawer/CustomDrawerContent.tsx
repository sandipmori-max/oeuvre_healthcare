import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import FastImage from 'react-native-fast-image';

import { useAppSelector } from '../../store/hooks';
import { firstLetterUpperCase } from '../../utils/helpers';
import { ERP_DRAWER_LIST } from '../../constants';
import { styles } from './drawer_style';
import { useBaseLink } from '../../hooks/useBaseLink';
import { DARK_COLOR } from '../../utils/constants';
import ContactRow from './ContactRow';
import { ERP_ICON } from '../../assets';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const navigation = useNavigation();
  const { user } = useAppSelector(state => state?.auth);
  const theme = useAppSelector(state => state.theme.mode);
  const baseLink = useBaseLink();
  const currentRoute = props.state.routeNames[props.state.index];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flexGrow: 1, backgroundColor: theme === 'dark' ? DARK_COLOR : 'white' }}
      showsVerticalScrollIndicator={true}
    >
      <View style={{ flex: 1, minWidth: '100%', }}>
        {/* Header */}
        <View style={[styles.header, theme === 'dark' && {
          backgroundColor: 'black'
        }]}>
          <FastImage
            source={{
              uri: `${baseLink}/FileUpload/1/UserMaster/${user?.id
                }/profileimage.jpeg?ts=${new Date().getTime()}`,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.web,
            }}
            style={styles.profileImage}
          />
          <View style={{ height: 28, width: 100 }} />
          <Text style={[styles.username, { top: 8, color: '#FFF' }]}>
            {firstLetterUpperCase(user?.name || '')}
          </Text>
          <View style={{ height: 8, width: 100 }} />
          <View style={{ top: 4, width: '100%', marginVertical: 1 }}>
            {/* Phone */}
            {user?.mobileno && (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 6 }}
              >
                <MaterialIcons name={'call'} color={'white'} size={14} />
                <Text style={styles.userPhone}>{user?.mobileno || ''}</Text>
              </View>
            )}

            {/* Email */}
            {user?.emailid && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 8,
                  padding: 6,
                  marginVertical: 2,
                }}
              >
                <MaterialIcons name={'mail-outline'} color={'white'} size={14} />
                <Text numberOfLines={1} style={styles.userPhone}>
                  {user?.emailid || ''}
                </Text>
              </View>
            )}

            {/* Role */}
            {user?.rolename && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 8,
                  padding: 6,
                  marginBottom: 2,
                }}
              >
                <MaterialIcons name={'person'} color={'white'} size={14} />
                <Text style={styles.userPhone}>{user?.rolename || ''}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Scrollable Menu */}
        <ScrollView
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.menuContainer}>
            {ERP_DRAWER_LIST.map(item => {
              const isActive = currentRoute === item?.route;
              return (
                <TouchableOpacity
                  key={item?.route}
                  style={[styles.drawerItem, isActive && styles.activeItemBackground,

                  isActive && theme === 'dark' && {
                    backgroundColor: 'black'
                  }
                  ]}
                  onPress={() => {
                    if (item?.route === 'Alert') {
                      props?.navigation.navigate('List', {
                        item: {
                          title: 'Notification',
                          name: 'Notification',
                          url: 'DEVNOTIFY',
                          isFromBusinessCard: false,
                          isFromAlertCard: true,
                          id: '0',
                        }
                      });
                      props?.navigation.closeDrawer();
                      return
                    }
                    if (item?.route === 'List') {
                      props?.navigation.navigate('List', {
                        item: {
                          title: 'Business Card',
                          name: 'Business Card',
                          url: 'BusinessCardMst',
                          isFromBusinessCard: true,
                          id: '0',
                        }
                      });
                      props?.navigation.closeDrawer();
                      return;
                    }
                    if (item?.route === 'Home') {
                      props?.navigation.navigate('Home', { screen: 'Home' });
                      props?.navigation.closeDrawer();
                      return;
                    } else {
                      props?.navigation.closeDrawer();
                      navigation.navigate(item?.route as never);
                    }
                  }}
                >
                  <View style={styles.itemRow}>
                    <MaterialIcons
                      name={`${item?.icon}`}
                      color={theme === 'dark' ? '#FFF' : isActive ? '#FFF' : '#000'}
                      size={20}
                    />
                    <Text
                      style={[
                        styles.itemLabel,
                        isActive && styles.activeText,
                        { color: theme === 'dark' ? 'white' : isActive ? '#FFF' : '#000' },
                      ]}
                    >
                      {item?.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer - stays fixed at bottom */}
        <View style={{
          width: '100%',
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
          marginBottom: 10
        }}>
          <Image source={ERP_ICON.APP_LOGO} style={{
            height: 40,
            width: 40,

          }} resizeMode="contain" />

        </View>
        <View style={styles.logoutButton}>
          <Text style={[styles.logoutText,
          theme === 'dark' && {
            color: 'white'
          }]}>(c) DevERP Solutions Pvt. Ltd.</Text>
          <ContactRow />
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;