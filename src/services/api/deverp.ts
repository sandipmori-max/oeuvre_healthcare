import { createAccountsTable, getActiveAccount, getDBConnection } from '../../utils/sqlite';
import apiClient from './config';
import {
  DevERPRequest,
  DevERPResponse,
  LoginRequest,
  LoginResponse,
  TokenRequest,
  TokenResponse,
  MenuRequest,
  MenuResponse,
  DashboardRequest,
  DashboardResponse,
  PageRequest,
  PageResponse,
  ListDataRequest,
  ListDataResponse,
} from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class DevERPService {
  private readonly baseUrl = '/devws';
  private link: string = '';
  private token: string = '';
  private tokenValidTill: string = '';
  private appid: string = '';
  private device: string = 'mobile';

  async getAppLink(code: string): Promise<DevERPResponse> {
    try {
      const response = await apiClient.post<DevERPResponse>(
        `${this.baseUrl}/appcode.aspx/getLink`,
        { code },
      );

      if (response.data.success === 1 && response.data.link) {
        this.link = response.data.link;
        await AsyncStorage.setItem('erp_link', this.link);
      }

      return response.data;
    } catch (error) {
      console.error('🚀 ~ DevERPService ~ getAppLink ~ error:', error);
      throw error;
    }
  }

  async validateCompanyCode(code: string): Promise<{
    isValid: boolean;
    appName?: string;
    appUrl?: string;
    message?: string;
  }> {
    try {
      const response = await this.getAppLink(code);

      if (response.success === 1) {
        return {
          isValid: true,
          appName: response.name,
          appUrl: response.link,
          message: 'Company code validated successfully',
        };
      } else {
        return {
          isValid: false,
          message: 'Invalid company code',
        };
      }
    } catch (error) {
      console.log('🚀 ~ DevERPService ~ validateCompanyCode ~ error:', error);
      return {
        isValid: false,
        message: 'Failed to validate company code',
      };
    }
  }

  async loginToERP(credentials: {
    user: string;
    pass: string;
    appid: string;
    firebaseid?: string;
  }): Promise<LoginResponse> {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      this.link = (await AsyncStorage.getItem('erp_link')) || this.link;
      if (!this.link) {
        throw new Error('No ERP link available. Please validate company code first.');
      }

      this.appid = credentials.appid;
      this.device = 'mobile';

      const loginData: LoginRequest = {
        user: credentials.user,
        pass: credentials.pass,
        appid: credentials.appid,
        firebaseid: credentials.firebaseid || '',
        device: this.device,
      };

      const response = await apiClient.post<LoginResponse>(
        `${this.link}msp_api.aspx/setAppID`,
        loginData,
      );

      return response.data;
    } catch (error) {
      console.error('🚀 ~ DevERPService ~ loginToERP ~ error:', error);
      throw error;
    }
  }

  async getAuth(isFromAddAccount?: boolean): Promise<string> {
    console.log(
      '🚀 ~ DevERPService ~ getAuth ~ isFromAddAccount:*-*-*-*-*-*-*-*-*',
      isFromAddAccount,
    );
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      if (!isFromAddAccount) {
        if (this.token && this.tokenValidTill) {
          const validTill = new Date(this.tokenValidTill);
          if (validTill > new Date()) {
            return this.token;
          }
        }
      }

      const tokenData: TokenRequest = {
        appid: this.appid,
        device: this.device,
      };

      const response = await apiClient.post<TokenResponse>(
        `${this.link}msp_api.aspx/getAuth`,
        tokenData,
      );

      if (String(response.data.success) === '1') {
        this.token = response.data.token || '';
        this.tokenValidTill = response.data.validTill || '';

        await AsyncStorage.setItem('erp_token', this.token);
        await AsyncStorage.setItem('erp_token_valid_till', this.tokenValidTill);
        const db = await getDBConnection();

        // ✅ Check if erp_accounts table exists
        const tableCheckResult = await db.executeSql(
          `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
          ['erp_accounts']
        );

        if (tableCheckResult[0].rows.length > 0) {
          const activeAccount = await getActiveAccount(db);

          if (activeAccount) {
            const updatedUser = {
              ...activeAccount.user,
              token: this.token,
              tokenValidTill: this.tokenValidTill,
            };

             await db.executeSql(
                `UPDATE erp_accounts SET user_json = ? WHERE id = ?`,
                [JSON.stringify(updatedUser), activeAccount.id]
              );

            console.log('🟢 Active account updated with new token in SQLite');
          } else {
            console.log('ℹ️ No active account to update');
          }
        } else {
          console.log('⚠️ erp_accounts table does not exist — skipping token update');
        }


        return this.token;
      } else {
        throw new Error(response.data.message || 'Failed to get token');
      }
    } catch (error) {
      console.error('🚀 ~ DevERPService ~ getAuth ~ error:', error);
      throw error;
    }
  }

  async getMenu(): Promise<string> {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      if (!this.token || !this.tokenValidTill) {
        const storedToken = await AsyncStorage.getItem('erp_token');
        const storedTokenValidTill = await AsyncStorage.getItem('erp_token_valid_till');

        if (storedToken && storedTokenValidTill) {
          const validTill = new Date(storedTokenValidTill);
          if (validTill > new Date()) {
            this.token = storedToken;
            this.tokenValidTill = storedTokenValidTill;
          } else {
            await this.getAuth();
          }
        } else {
          await this.getAuth();
        }
      } else {
        const validTill = new Date(this.tokenValidTill);
        if (validTill <= new Date()) {
          await this.getAuth();
        }
      }

      const menuData: MenuRequest = {
        token: this.token,
      };

      const response = await apiClient.post<MenuResponse>(
        `${this.link}msp_api.aspx/getMenu`,
        menuData,
      );

      if (
        String(response.data.success) === '0' &&
        response.data.message?.includes('Token Expire')
      ) {
        await this.getAuth();
        const retryResponse = await apiClient.post<MenuResponse>(
          `${this.link}/msp_api.aspx/getMenu`,
          { token: this.token },
        );
        return JSON.stringify(retryResponse.data);
      } else if (String(response.data.success) === '1') {
        return JSON.stringify(response.data);
      } else {
        throw new Error(response.data.message || 'Failed to get menu');
      }
    } catch (error) {
      console.error('🚀 ~ DevERPService ~ getMenu ~ error:', error);
      throw error;
    }
  }

  async getDashboard(): Promise<string> {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      if (!this.token || !this.tokenValidTill) {
        const storedToken = await AsyncStorage.getItem('erp_token');
        const storedTokenValidTill = await AsyncStorage.getItem('erp_token_valid_till');

        if (storedToken && storedTokenValidTill) {
          const validTill = new Date(storedTokenValidTill);
          if (validTill > new Date()) {
            this.token = storedToken;
            this.tokenValidTill = storedTokenValidTill;
          } else {
            await this.getAuth();
          }
        } else {
          await this.getAuth();
        }
      } else {
        const validTill = new Date(this.tokenValidTill);
        if (validTill <= new Date()) {
          await this.getAuth();
        }
      }

      const dashboardData: DashboardRequest = {
        token: this.token,
      };

      const response = await apiClient.post<DashboardResponse>(
        `${this.link}msp_api.aspx/getDB`,
        dashboardData,
      );

      if (
        String(response.data.success) === '0' &&
        response.data.message?.includes('Token Expire')
      ) {
        await this.getAuth();
        const retryResponse = await apiClient.post<DashboardResponse>(
          `${this.link}msp_api.aspx/getDB`,
          { token: this.token },
        );
        return JSON.stringify(retryResponse.data);
      } else if (String(response.data.success) === '1') {
        return JSON.stringify(response.data);
      } else {
        throw new Error(response.data.message || 'Failed to get dashboard data');
      }
    } catch (error) {
      console.error('🚀 ~ DevERPService ~ getDashboard ~ error:', error);
      throw error;
    }
  }

  async getPage(page: string): Promise<string> {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      if (!this.token || !this.tokenValidTill) {
        const storedToken = await AsyncStorage.getItem('erp_token');
        const storedTokenValidTill = await AsyncStorage.getItem('erp_token_valid_till');

        if (storedToken && storedTokenValidTill) {
          const validTill = new Date(storedTokenValidTill);
          if (validTill > new Date()) {
            this.token = storedToken;
            this.tokenValidTill = storedTokenValidTill;
          } else {
            await this.getAuth();
          }
        } else {
          await this.getAuth();
        }
      } else {
        const validTill = new Date(this.tokenValidTill);
        if (validTill <= new Date()) {
          await this.getAuth();
        }
      }

      const pageData: PageRequest = {
        token: this.token,
        page: page,
      };

      const response = await apiClient.post<PageResponse>(
        `${this.link}msp_api.aspx/getPage`,
        pageData,
      );

      if (
        String(response.data.success) === '0' &&
        (response.data as any).message?.includes('Token Expire')
      ) {
        await this.getAuth();
        const retryResponse = await apiClient.post<PageResponse>(
          `${this.link}/msp_api.aspx/getPage`,
          { token: this.token, page: page },
        );
        const retryParsed: any = retryResponse.data as any;
        if (typeof retryParsed?.data === 'string' && retryParsed.data) return retryParsed.data;
        if (retryParsed?.data && typeof retryParsed.data.d === 'string') return retryParsed.data.d;
        return JSON.stringify(retryParsed);
      } else if (String((response.data as any).success) === '1') {
        const parsed: any = response.data as any;
        if (typeof parsed?.data === 'string' && parsed.data) return parsed.data;
        if (parsed?.data && typeof parsed.data.d === 'string') return parsed.data.d;
        return JSON.stringify(parsed);
      } else {
        throw new Error(response.data.message || 'Failed to get page data');
      }
    } catch (error) {
      console.error('🚀 ~ DevERPService ~ getPage ~ error:', error);
      throw error;
    }
  }

  async getListData(page: string, fromDate: string, toDate: string, param: string): Promise<string> {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      if (!this.token || !this.tokenValidTill) {
        const storedToken = await AsyncStorage.getItem('erp_token');
        const storedTokenValidTill = await AsyncStorage.getItem('erp_token_valid_till');

        if (storedToken && storedTokenValidTill) {
          const validTill = new Date(storedTokenValidTill);
          if (validTill > new Date()) {
            this.token = storedToken;
            this.tokenValidTill = storedTokenValidTill;
          } else {
            await this.getAuth();
          }
        } else {
          await this.getAuth();
        }
      } else {
        const validTill = new Date(this.tokenValidTill);
        if (validTill <= new Date()) {
          await this.getAuth();
        }
      }

      const listData: ListDataRequest = {
        token: this.token,
        page: page,
        fd: fromDate,
        td: toDate,
        param: param || '',
      };

      const response = await apiClient.post<ListDataResponse>(
        `${this.link}msp_api.aspx/getListData`,
        listData,
      );

      if (response.data.success === 0 && response.data.message?.includes('Token Expire')) {
        await this.getAuth();
        const retryResponse = await apiClient.post<ListDataResponse>(
          `${this.link}msp_api.aspx/getListData`,
          { token: this.token, page: page, fd: fromDate, td: toDate },
        );
        return retryResponse.data.data || '';
      } else if (response.data.success === 1) {
        return response.data.data || '';
      } else {
        throw new Error(response.data.message || 'Failed to get list data');
      }
    } catch (error) {
      console.error('🚀 ~ DevERPService ~ getListData ~ error:', error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    try {
      this.link = (await AsyncStorage.getItem('erp_link')) || '';
      this.token = (await AsyncStorage.getItem('erp_token')) || '';
      this.tokenValidTill = (await AsyncStorage.getItem('erp_token_valid_till')) || '';
      this.appid = (await AsyncStorage.getItem('erp_appid')) || '';
    } catch (error) {
      console.error('🚀 ~ DevERPService ~ initialize ~ error:', error);
    }
  }

  async clearData(): Promise<void> {
    try {
      this.link = '';
      this.token = '';
      this.tokenValidTill = '';
      this.appid = '';

      await AsyncStorage.multiRemove([
        'erp_link',
        'erp_token',
        'erp_token_valid_till',
        'erp_appid',
      ]);
    } catch (error) {
      console.error('🚀 ~ DevERPService ~ clearData ~ error:', error);
    }
  }

  setToken(token: string) {
    this.token = token;
    AsyncStorage.setItem('erp_token', token);
  }
}

export default new DevERPService();
