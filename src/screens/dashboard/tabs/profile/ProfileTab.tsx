import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import AccountSwitcher from './components/AccountSwitcher';
import { styles } from './profile_style';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../../../store/hooks';
import { firstLetterUpperCase, formatDateHr } from '../../../../utils/helpers';
import AddAccountScreen from '../../add_account/AddAccountScreen';
import ERPIcon from '../../../../components/icon/ERPIcon';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const ProfileTab = () => {
  const navigation = useNavigation<any>();
  const { user, accounts } = useAppSelector(state => state?.auth);
  console.log('🚀 ~ ProfileTab ~ user:', user);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const handleAddAccount = () => {
    setShowAccountSwitcher(false);
    setShowAddAccount(true);
  };

  const activeAccount = accounts.find(acc => acc.user.id === user?.id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <ERPIcon
            name="add"
            onPress={() => {
              handleAddAccount();
            }}
          />
          <ERPIcon name="refresh" />
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
        {user && (
          <TouchableOpacity
            onPress={() => {
              console.log("🚀 ~ onPress:", 'onPress')
              navigation.navigate('ProfileEdit')
            }}
            style={styles.profileCard}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <MaterialIcons name={'person'} color={'#000'} size={40} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{firstLetterUpperCase(user?.name)}</Text>
                <Text style={styles.profileEmail}>{user?.company_code}</Text>
                <Text style={styles.accountType}>
                  {(user?.accountType?.toUpperCase() || 'PERSONAL') + ' ACCOUNT'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.8}
              >
                <MaterialIcons name={'settings'} color={'#000'} size={28} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <TouchableOpacity style={styles.settingCard} onPress={() => setShowAccountSwitcher(true)}>
            <View style={styles.settingHeader}>
              <View style={styles.settingIcon}>
                <MaterialIcons name={'group'} color={'#000'} size={22} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Manage Accounts</Text>
                <Text style={styles.settingSubtitle}>
                  {accounts?.length} account{accounts?.length !== 1 ? 's' : ''} available
                </Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </View>
          </TouchableOpacity>

          {activeAccount && (
            <View style={styles.settingCard}>
              <View style={styles.settingHeader}>
                <View style={styles.settingIcon}>
                  <MaterialIcons name={'access-time'} color={'#000'} size={22} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Last Login</Text>
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
