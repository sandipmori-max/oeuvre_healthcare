import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, } from 'react-native';

import AccountSwitcher from './components/AccountSwitcher';
import { styles } from './profile_style';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../../store/hooks';
import { formatDateHr } from '../../../../utils/helpers';
import AddAccountScreen from '../../add_account/AddAccountScreen';
import ERPIcon from '../../../../components/icon/ERPIcon';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useBaseLink } from '../../../../hooks/useBaseLink';
import { useTranslation } from 'react-i18next';
import { ERP_COLOR_CODE } from '../../../../utils/constants';
import ProfileSection from './ProfileSection';
 
const ProfileTab = () => {
  const {t} = useTranslation()
  const navigation = useNavigation<any>();
  const { user, accounts } = useAppSelector(state => state?.auth);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const baseLink = useBaseLink();

  const handleAddAccount = () => {
    setShowAccountSwitcher(false);
    setShowAddAccount(true);
  };

  const activeAccount = accounts?.find(acc => acc?.user?.id === user?.id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <ERPIcon
            name="person-add-alt"
            onPress={() => {
              handleAddAccount();
            }}
          />
          <ERPIcon
            name="settings"
            onPress={() => {
              navigation.navigate('Settings');
            }}
          />
        </>
      ),
      headerLeft: () => (
        <>
          <ERPIcon extSize={24} isMenu={true} name="menu" onPress={() => navigation.openDrawer()} />
        </>
      ),
    });
  }, [navigation]);
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
         <ProfileSection 
          user={user}
          baseLink={baseLink}
          onEditPress={() =>
            navigation.navigate('Page', {
              id: user?.id,
              title: t('profile.myProfile'),
              isFromNew: false,
              url: 'UserProfile',
            })
          }
        />

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{t('profile.accountManagement')}</Text>
          <TouchableOpacity style={styles.settingCard} onPress={() => setShowAccountSwitcher(true)}>
            <View style={styles.settingHeader}>
              <View style={styles.settingIcon}>
                <MaterialIcons name={'group'} color={ERP_COLOR_CODE.ERP_BLACK} size={22} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t('profile.manageAccounts')}</Text>
                <Text style={styles.settingSubtitle}>
                  {accounts?.length} {t('profile.account')}{accounts?.length !== 1 ? 's' : ''} {t('profile.available')}
                </Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>

          {activeAccount && (
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={styles.settingIcon}>
                  <MaterialIcons name={'access-time'} color={ERP_COLOR_CODE.ERP_BLACK} size={22} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{t('profile.lastLogin')}</Text>
                  <Text style={styles.settingSubtitle}>
                    {formatDateHr(activeAccount?.lastLoginAt, false)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <AccountSwitcher
        visible={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
        onAddAccount={handleAddAccount}
      />

      <AddAccountScreen visible={showAddAccount} onClose={() => setShowAddAccount(false)} />
    </View>
  );
};

export default ProfileTab;
