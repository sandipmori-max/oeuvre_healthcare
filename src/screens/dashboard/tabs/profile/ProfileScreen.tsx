import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import AccountSwitcher from './components/AccountSwitcher';
import { styles } from './profile_style';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../../../navigation/types';
import { useAppSelector } from '../../../../store/hooks';
import { firstLetterUpperCase, formatDateMonthDateYear } from '../../../../utils/helpers';
import AddAccountScreen from '../../add_account/AddAccountScreen';

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { user, accounts } = useAppSelector(state => state?.auth);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const handleAddAccount = () => {
    setShowAccountSwitcher(false);
    setShowAddAccount(true);
  };

  const activeAccount = accounts.find(acc => acc.user.id === user?.id);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        {user && (
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={{ fontSize: 32 }}>👤</Text>
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
                <Text style={styles.switchButtonText}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          <TouchableOpacity style={styles.settingCard} onPress={() => setShowAccountSwitcher(true)}>
            <View style={styles.settingHeader}>
              <View style={styles.settingIcon}>
                <Text style={styles.iconText}>👥</Text>
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
                  <Text style={styles.iconText}>🕒</Text>
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Last Login</Text>
                  <Text style={styles.settingSubtitle}>
                    {formatDateMonthDateYear(activeAccount?.lastLoginAt)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.addAccountButton}
          onPress={handleAddAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.addAccountButtonText}>+ Add Another Account</Text>
        </TouchableOpacity>
      </View>

      <AccountSwitcher
        visible={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
        onAddAccount={handleAddAccount}
      />

      <AddAccountScreen visible={showAddAccount} onClose={() => setShowAddAccount(false)} />
    </View>
  );
};

export default ProfileScreen;
