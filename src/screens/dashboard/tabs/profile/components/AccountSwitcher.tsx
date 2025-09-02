import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { styles } from './components_style';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { removeAccountThunk, switchAccountThunk } from '../../../../../store/slices/auth/thunk';
import { Account } from '../../../../../store/slices/auth/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevERPService } from '../../../../../services/api';
import CustomAlert from '../../../../../components/alert/CustomAlert';
import { ERP_ICON } from '../../../../../assets';
import { useApi } from '../../../../../hooks/useApi';
import {
  formatDateHr,
  formatDateMonthDateYear,
  formatTimeTo12Hour,
  isTokenValid,
} from '../../../../../utils/helpers';
import MaterialIcons from '@react-native-vector-icons/material-icons';

interface AccountSwitcherProps {
  visible: boolean;
  onClose: () => void;
  onAddAccount: () => void;
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({ visible, onClose, onAddAccount }) => {
  const dispatch = useAppDispatch();
  const { execute: validateCompanyCode } = useApi();

  const { accounts, activeAccountId } = useAppSelector(state => state.auth);
  console.log('🚀 ~ AccountSwitcher ~ accounts:----------------', accounts);
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
    const isActive = item?.id.toString() === activeAccountId?.toString();
    console.log('🚀 ~ renderAccount ~ item:', item);
    console.log('🚀 ~ renderAccount ~ isActive:', isActive);
    const lastLogin = formatDateHr(item?.lastLoginAt, false);
    const lastLoginHr = formatTimeTo12Hour(item?.lastLoginAt);

    return (
      <TouchableOpacity
        style={[styles.accountItem, isActive && styles.activeAccount]}
        onPress={async () => {
          if (isTokenValid(item?.user?.tokenValidTill)) {
            console.log('🚀 ~ item:', 'IF ________________________________________ CALLED', item);
            await DevERPService.setToken(item?.user?.token || '');
            await AsyncStorage.setItem('erp_token', item?.user?.token || '');
            await AsyncStorage.setItem('auth_token', item?.user?.token || '');
            const validation = await validateCompanyCode(() =>
              DevERPService.validateCompanyCode(item?.user?.company_code),
            );
            console.log('🚀 ~ validation:', validation);
            if (!validation?.isValid) {
              return;
            }
            handleSwitchAccount(item?.id);
          } else {
            console.log(
              '🚀 ~ item:',
              'ELESPART ________________________________________ CALLED',
              item,
            );

            const validation = await validateCompanyCode(() =>
              DevERPService.validateCompanyCode(item?.user?.company_code),
            );
            if (!validation?.isValid) {
              return;
            }
            await DevERPService.getAuth();
            handleSwitchAccount(item?.id);
          }
        }}
      >
        <View style={styles.accountContent}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600' }}
            style={styles.avatar}
          />
          <View style={styles.accountInfo}>
            <Text style={[styles.accountName, isActive && styles.activeText]}>
              {item?.user?.name.charAt(0).toUpperCase() + item?.user?.name.slice(1)}
            </Text>
            <Text style={[styles.accountEmail, isActive && styles.activeText]}>
              {item?.user?.company_code}
            </Text>
            <Text style={[styles.accountEmail, isActive && styles.activeText]}>
              {item?.user?.token}
            </Text>
            <View
              style={{
                width: isActive ? '100%' : '80%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  gap: 2,
                  flexDirection: 'row',
                  alignContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MaterialIcons name={'date-range'} color={'#ccc'} size={18} />
                <Text style={styles.lastLogin}> {lastLogin}</Text>
              </View>

              <View
                style={{
                  gap: 2,
                  flexDirection: 'row',
                  alignContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MaterialIcons name={'access-alarm'} color={'#ccc'} size={18} />
                <Text style={styles.lastLogin}>{lastLoginHr}</Text>
              </View>
            </View>
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Image source={ERP_ICON.BACK} style={styles.back} />
          </TouchableOpacity>
          <Text style={styles.title}>Switch Account</Text>
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
        doneText="Remove"
        color="red"
        actionLoader={undefined}
      />
    </Modal>
  );
};

export default AccountSwitcher;
