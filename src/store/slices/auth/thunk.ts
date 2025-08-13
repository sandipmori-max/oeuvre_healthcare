import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDBConnection,
  createAccountsTable,
  insertAccount,
  updateAccountActive,
  getAccounts,
  getActiveAccount,
  removeAccount as sqliteRemoveAccount,
} from '../../../utils/sqlite';
import { Account, User } from './type';
import { AuthService, DevERPService } from '../../../services/api';

// Async thunks
export const checkAuthStateThunk = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { rejectWithValue }) => {
    try {
      const db = await getDBConnection();
      await createAccountsTable(db);
      const accounts = await getAccounts(db);
      const activeAccount = await getActiveAccount(db);
      
      // Check if we have a valid token for the active account
      if (activeAccount?.user?.token) {
        const tokenValidTill = activeAccount.user.tokenValidTill;
        if (tokenValidTill) {
          const validTill = new Date(tokenValidTill);
          if (validTill > new Date()) {
            // Token is still valid, user is authenticated
            return {
              accounts,
              activeAccountId: activeAccount.id,
              user: activeAccount.user,
            };
          }
        }
      }
      
      // No valid token found, user needs to login again
      return {
        accounts,
        activeAccountId: null,
        user: null,
      };
    } catch (error) {
      console.error('Error checking auth state:', error);
      return rejectWithValue('Failed to check authentication state');
    }
  },
);

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (
    { 
      newToken,
      newvalidTill,
      company_code, password, isAddingAccount = false, user_credentials }: { 
      company_code: string; 
      password: string; 
      isAddingAccount?: boolean;
      newToken?: string;
      newvalidTill?: string;
      user_credentials?: { user: string; name?: string };
    },
    { rejectWithValue },
  ) => {
    try {
      // This thunk only handles database operations and local storage
      // The ERP login and token fetch is already done in LoginScreen
      
      // Get authentication token that was already fetched in LoginScreen
      const token = isAddingAccount ? newToken : await AsyncStorage.getItem('erp_token');
      console.log("🚀 ~ token:", token)
      const tokenValidTill = isAddingAccount ? newvalidTill : await AsyncStorage.getItem('erp_token_valid_till');
      console.log("🚀 ~ tokenValidTill:", tokenValidTill)
      
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }
      
      console.log('🚀 ~ token:------------', token);
      
      // Store tokens in AsyncStorage for consistency
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('erp_appid', company_code);

      // Create user object from ERP data
      const erpUser: User = {
        id: `user_${Date.now()}`,
        name: user_credentials?.name || user_credentials?.user || company_code.toUpperCase(),
        company_code: company_code,
        avatar: `https://ui-avatars.com/api/?name=${(user_credentials?.name || user_credentials?.user || company_code).toUpperCase()}&background=007AFF&color=fff`,
        accountType: 'erp',
        token: token,
        tokenValidTill: tokenValidTill,
      };

      const db = await getDBConnection();
      await createAccountsTable(db);
      const currentAccounts = await getAccounts(db);
      const existingAccount = currentAccounts?.find((acc: Account) => acc.user.company_code === company_code);
      
      if (existingAccount && !isAddingAccount) {
        await updateAccountActive(db, existingAccount?.id);
        return {
          user: existingAccount.user,
          accountId: existingAccount.id,
          isNewAccount: false,
        };
      }

      const newAccount: Account = {
        id: erpUser?.id,
        user: erpUser,
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      };

      // Set all other accounts inactive
      for (const acc of currentAccounts ?? []) {
        await insertAccount(db, { ...acc, isActive: false });
      }
      
      await insertAccount(db, newAccount);
      await updateAccountActive(db, newAccount?.id);
      const updatedAccounts = await getAccounts(db);
      
      return {
        user: erpUser,
        accountId: erpUser?.id,
        isNewAccount: true,
        accounts: updatedAccounts,
      };
    } catch (error: any) {
      console.log('Login error:', error);
      return rejectWithValue(error?.message || 'Login failed. Please try again.');
    }
  },
);

export const switchAccountThunk = createAsyncThunk(
  'auth/switchAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const db = await getDBConnection();
      await createAccountsTable(db);
      await updateAccountActive(db, accountId);
      const accounts = await getAccounts(db);
      const targetAccount = accounts?.find((acc: Account) => acc?.id === accountId);
      if (!targetAccount) {
        return rejectWithValue('Account not found');
      }
      
      // Check if the target account has a valid token
      if (targetAccount?.user?.token) {
        const tokenValidTill = targetAccount.user.tokenValidTill;
        if (tokenValidTill) {
          const validTill = new Date(tokenValidTill);
          if (validTill > new Date()) {
            // Token is still valid, can switch to this account
            return {
              user: targetAccount.user,
              accountId,
              accounts,
            };
          }
        }
      }
      
      // Token expired or not found, need to login again
      return rejectWithValue('Account token expired. Please login again.');
    } catch (error) {
      console.error('Error switching account:', error);
      return rejectWithValue('Failed to switch account');
    }
  },
);

export const removeAccountThunk = createAsyncThunk(
  'auth/removeAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const db = await getDBConnection();
      await createAccountsTable(db);
      await sqliteRemoveAccount(db, accountId);
      const updatedAccounts = await getAccounts(db);
      let newActiveAccountId = null;
      let newActiveAccount = null;
      if (updatedAccounts && updatedAccounts?.length > 0) {
        // If the removed account was active, set the first account as active
        const wasActive = !updatedAccounts.some(acc => acc.isActive);
        if (wasActive) {
          await updateAccountActive(db, updatedAccounts[0].id);
        }
        const activeAccount = await getActiveAccount(db);
        newActiveAccountId = activeAccount?.id || null;
        newActiveAccount = activeAccount?.user || null;
      }
      return {
        accounts: updatedAccounts,
        user: newActiveAccount,
        activeAccountId: newActiveAccountId,
      };
    } catch (error) {
      console.error('Error removing account:', error);
      return rejectWithValue('Failed to remove account');
    }
  },
);

export const logoutUserThunk = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await DevERPService.clearData();
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'token_expires_at',
        'erp_link',
        'erp_token',
        'erp_token_valid_till',
        'erp_appid',
      ]);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'token_expires_at',
        'erp_link',
        'erp_token',
        'erp_token_valid_till',
        'erp_appid',
      ]);
      return { success: true };
    }
  },
);

export const refreshTokenThunk = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await AuthService.refreshToken(refreshToken);
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('refresh_token', response.refreshToken);
      await AsyncStorage.setItem('token_expires_at', response.expiresAt);
      return response;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'token_expires_at',
      ]);
      return rejectWithValue(error?.message || 'Token refresh failed');
    }
  },
);

export const validateCompanyCodeThunk = createAsyncThunk(
  'auth/validateCompanyCode',
  async (companyCode: string, { rejectWithValue }) => {
    try {
      const result = await DevERPService.validateCompanyCode(companyCode);
      return result;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to validate company code');
    }
  },
);

export const getERPMenuThunk = createAsyncThunk(
  'auth/getERPMenu',
  async (_, { rejectWithValue }) => {
    try {
      const response = await DevERPService.getMenu();
      console.log('🚀 ~ getERPMenuThunk ~ raw response:', response);
      
      // The API can return either a string (JSON) or an object
      if (response && typeof response === 'string') {
        console.log('🚀 ~ getERPMenuThunk ~ response is string, length:', response.length);
        return response; // Return the string directly, let the slice handle parsing
      } else if (response && typeof response === 'object') {
        console.log('🚀 ~ getERPMenuThunk ~ response is object, returning directly');
        return response; // Return the object directly
      }
      
      console.log('🚀 ~ getERPMenuThunk ~ response is invalid:', typeof response);
      return rejectWithValue('Invalid menu response format');
    } catch (error: any) {
      console.error('🚀 ~ getERPMenuThunk ~ error:', error);
      return rejectWithValue(error?.message || 'Failed to get ERP menu');
    }
  },
);

export const getERPDashboardThunk = createAsyncThunk(
  'auth/getERPDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const dashboard = await DevERPService.getDashboard();
      return dashboard;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to get ERP dashboard');
    }
  },
);

export const getERPPageThunk = createAsyncThunk(
  'auth/getERPPage',
  async (page: string, { rejectWithValue }) => {
    try {
      const pageData = await DevERPService.getPage(page);
      return pageData;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to get ERP page data');
    }
  },
);

export const getERPListDataThunk = createAsyncThunk(
  'auth/getERPListData',
  async ({ page, fromDate, toDate }: { page: string; fromDate: string; toDate: string }, { rejectWithValue }) => {
    try {
      const listData = await DevERPService.getListData(page, fromDate, toDate);
      return listData;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to get ERP list data');
    }
  },
);
