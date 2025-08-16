import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { styles } from './components_style';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { removeAccountThunk, switchAccountThunk } from '../../../../../store/slices/auth/thunk';
import { Account } from '../../../../../store/slices/auth/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevERPService } from '../../../../../services/api';
import CustomAlert from '../../../../../components/alert/CustomAlert';

interface AccountSwitcherProps {
  visible: boolean;
  onClose: () => void;
  onAddAccount: () => void;
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({ visible, onClose, onAddAccount }) => {
  const dispatch = useAppDispatch();
  const { accounts, activeAccountId } = useAppSelector(state => state.auth);
  const [alertVisible, setAlertVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
  });

  const handleSwitchAccount = (accountId: string) => {
    if (accountId !== activeAccountId) {
      dispatch(switchAccountThunk(accountId));
    }

    onClose();
  };

  const handleRemovedAccount = (accountId: string) => {
    if (accountId !== activeAccountId) {
      dispatch(removeAccountThunk(accountId));
    }

    onClose();
  };

  const handleRemoveAccount = (account: Account) => {
    setAlertConfig({
      title: 'Remove Account',
      message: `Are you sure you want to remove ${account?.user?.company_code}?`,
      type: 'error',
    });
    setSelectedAccount(account?.id);
    setAlertVisible(true);
  };

  const renderAccount = ({ item }: { item: Account }) => {
    const isActive = item?.id === activeAccountId;
    const lastLogin = new Date(item?.lastLoginAt).toLocaleDateString();

    return (
      <TouchableOpacity
        style={[styles.accountItem, isActive && styles.activeAccount]}
        onPress={async () => {
          if (new Date(item?.user?.tokenValidTill) > new Date()) {
            console.log('🚀 ~ item:', item);
            await AsyncStorage.setItem('erp_token', item?.user?.token || '');
            await AsyncStorage.setItem('auth_token', item?.user?.token || '');
            DevERPService.setToken(item?.user?.token || '');
            handleSwitchAccount(item?.id);
          }
        }}
      >
        <View style={styles.accountContent}>
          <Image source={{ uri: item?.user?.avatar }} style={styles.avatar} />
          <View style={styles.accountInfo}>
            <Text style={[styles.accountName, isActive && styles.activeText]}>
              {item?.user?.name}
            </Text>
            <Text style={[styles.accountEmail, isActive && styles.activeText]}>
              {item?.user?.company_code}
            </Text>
            <Text style={styles.lastLogin}>Last login: {lastLogin}</Text>
            <Text style={styles.lastLogin}>Last login: {item?.user?.token}</Text>
          </View>
          {isActive && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeLabel}>Active</Text>
            </View>
          )}
        </View>
        {!isActive && accounts?.length > 1 && (
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveAccount(item)}>
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Switch Account</Text>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✖ Cancel</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={item => item?.id}
          style={styles.accountsList}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity style={styles.addAccountButton} onPress={onAddAccount}>
          <Text style={styles.addAccountText}>+ Add Another Account</Text>
        </TouchableOpacity>
      </View>
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
        onDone={() => {
          handleRemovedAccount(selectedAccount);
        }}
      />
    </Modal>
  );
};

export default AccountSwitcher;
