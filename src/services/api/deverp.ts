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
  ListDataResponse
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

  /**
   * Get application link for specific code (like payroll, attendance, etc.)
   * Example: getAppLink('payroll') returns the payroll application URL
   */
  async getAppLink(code: string): Promise<DevERPResponse> {
    try {
      const response = await apiClient.post<DevERPResponse>(
        `${this.baseUrl}/appcode.aspx/getLink`,
        { code }
      );
      console.log("🚀 ~ DevERPService ~ getAppLink ~ response:", response);
      
      // Store the link for future use
      if (response.data.success === 1 && response.data.link) {
        this.link = response.data.link;
        await AsyncStorage.setItem('erp_link', this.link);
      }
      
      return response.data;
    } catch (error) {
      console.error("🚀 ~ DevERPService ~ getAppLink ~ error:", error);
      throw error;
    }
  }

  /**
   * Validate company code and get application details
   */
  async validateCompanyCode(code: string): Promise<{
    isValid: boolean;
    appName?: string;
    appUrl?: string;
    message?: string;
  }> {
    try {
      const response = await this.getAppLink(code);
      console.log("🚀 ~ DevERPService ~ validateCompanyCode ~ response:", response)
      
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
      console.log("🚀 ~ DevERPService ~ validateCompanyCode ~ error:", error)
      return {
        isValid: false,
        message: 'Failed to validate company code',
      };
    }
  }

  /**
   * Login to ERP system
   */
  async loginToERP(credentials: {
    user: string;
    pass: string;
    appid: string;
    firebaseid?: string;
  }): Promise<LoginResponse> {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      // Get stored link or use default
      this.link = await AsyncStorage.getItem('erp_link') || this.link;
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
        loginData
      );
      
      console.log("🚀 ~ DevERPService ~ loginToERP ~ response:", response);
      return response.data;
    } catch (error) {
      console.error("🚀 ~ DevERPService ~ loginToERP ~ error:", error);
      throw error;
    }
  }

  /**
   * Get authentication token
   */
  async getAuth(isFromAddAccount?: boolean): Promise<string> {
    console.log("🚀 ~ DevERPService ~ getAuth ~ isFromAddAccount:*-*-*-*-*-*-*-*-*", isFromAddAccount)
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      // Check if token is still valid
      if(!isFromAddAccount){
      if (this.token && this.tokenValidTill) {
              const validTill = new Date(this.tokenValidTill);
              if (validTill > new Date()) {
                return this.token;
              }
            }
      }
    console.log("🚀 ~ DevERPService ~ getAuth ~ isFromAddAccount:*-*-*-*-*-*-*-*-------------------------*", isFromAddAccount)
     

      const tokenData: TokenRequest = {
        appid: this.appid,
        device: this.device,
      };

      const response = await apiClient.post<TokenResponse>(
        `${this.link}msp_api.aspx/getAuth`,
        tokenData
      );

      console.log("🚀 ~ DevERPService ~ getAuth ~ response:------------------", response);

      if (String(response.data.success) === '1') {
        this.token = response.data.token || '';
        this.tokenValidTill = response.data.validTill || '';
        
        // Store token info
        await AsyncStorage.setItem('erp_token', this.token);
        await AsyncStorage.setItem('erp_token_valid_till', this.tokenValidTill);
        
        return this.token;
      } else {
        throw new Error(response.data.message || 'Failed to get token');
      }
    } catch (error) {
      console.error("🚀 ~ DevERPService ~ getAuth ~ error:", error);
      throw error;
    }
  }

  /**
   * Get menu data
   */
  async getMenu(): Promise<string> {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      // First, try to get stored token from AsyncStorage if not available in memory
      if (!this.token || !this.tokenValidTill) {
        const storedToken = await AsyncStorage.getItem('erp_token');
        const storedTokenValidTill = await AsyncStorage.getItem('erp_token_valid_till');
        
        if (storedToken && storedTokenValidTill) {
          // Check if stored token is still valid
          const validTill = new Date(storedTokenValidTill);
          if (validTill > new Date()) {
            // Use stored token
            this.token = storedToken;
            this.tokenValidTill = storedTokenValidTill;
          } else {
            // Stored token expired, get new one
            await this.getAuth();
          }
        } else {
          // No stored token, get new one
          await this.getAuth();
        }
      } else {
        // Check if current token is still valid
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
        menuData
      );

      console.log("🚀 ~ DevERPService ~ getMenu ~ response:", response);

      if (String(response.data.success) === '0' && response.data.message?.includes('Token Expire')) {
        // Token expired, get new token and retry
        await this.getAuth();
        const retryResponse = await apiClient.post<MenuResponse>(
          `${this.link}/msp_api.aspx/getMenu`,
          { token: this.token }
        );
        // Return the entire response data for retry
        return JSON.stringify(retryResponse.data);
      } else if (String(response.data.success) === '1') {
        // The API returns data directly in response.data with success and menus
        return JSON.stringify(response.data);
      } else {
        throw new Error(response.data.message || 'Failed to get menu');
      }
    } catch (error) {
      console.error("🚀 ~ DevERPService ~ getMenu ~ error:", error);
      throw error;
    }
  }

  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<string> {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      // First, try to get stored token from AsyncStorage if not available in memory
      if (!this.token || !this.tokenValidTill) {
        const storedToken = await AsyncStorage.getItem('erp_token');
        const storedTokenValidTill = await AsyncStorage.getItem('erp_token_valid_till');
        
        if (storedToken && storedTokenValidTill) {
          // Check if stored token is still valid
          const validTill = new Date(storedTokenValidTill);
          if (validTill > new Date()) {
            // Use stored token
            this.token = storedToken;
            this.tokenValidTill = storedTokenValidTill;
          } else {
            // Stored token expired, get new one
            await this.getAuth();
          }
        } else {
          // No stored token, get new one
          await this.getAuth();
        }
      } else {
        // Check if current token is still valid
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
        dashboardData
      );

      console.log("🚀 ~ DevERPService ~ getDashboard ~ response:", response);

      if (String(response.data.success) === '0' && response.data.message?.includes('Token Expire')) {
        // Token expired, get new token and retry
        await this.getAuth();
        const retryResponse = await apiClient.post<DashboardResponse>(
          `${this.link}msp_api.aspx/getDB`,
          { token: this.token }
        );
        // Return the entire response data for retry
        return JSON.stringify(retryResponse.data);
      } else if (String(response.data.success) === '1') {
        // Return the entire response data
        return JSON.stringify(response.data);
      } else {
        throw new Error(response.data.message || 'Failed to get dashboard data');
      }
    } catch (error) {
      console.error("🚀 ~ DevERPService ~ getDashboard ~ error:", error);
      throw error;
    }
  }

  /**
   * Get page data
   */
  async getPage(page: string): Promise<string> {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      // First, try to get stored token from AsyncStorage if not available in memory
      if (!this.token || !this.tokenValidTill) {
        const storedToken = await AsyncStorage.getItem('erp_token');
        console.log("🚀 ~ DevERPService ~ getPage ~ storedToken:", storedToken)
        const storedTokenValidTill = await AsyncStorage.getItem('erp_token_valid_till');
        
        if (storedToken && storedTokenValidTill) {
          // Check if stored token is still valid
          const validTill = new Date(storedTokenValidTill);
          if (validTill > new Date()) {
            // Use stored token
            this.token = storedToken;
            this.tokenValidTill = storedTokenValidTill;
          } else {
            // Stored token expired, get new one
            await this.getAuth();
          }
        } else {
          // No stored token, get new one
          await this.getAuth();
        }
      } else {
        // Check if current token is still valid
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
        pageData
      );

      console.log("🚀 ~ DevERPService ~ getPage ~ response:", response);

      if (String(response.data.success) === '0' && (response.data as any).message?.includes('Token Expire')) {
        // Token expired, get new token and retry
        await this.getAuth();
        const retryResponse = await apiClient.post<PageResponse>(
          `${this.link}/msp_api.aspx/getPage`,
          { token: this.token, page: page }
        );
        const retryParsed: any = retryResponse.data as any;
        if (typeof retryParsed?.data === 'string' && retryParsed.data) return retryParsed.data;
        if (retryParsed?.data && typeof retryParsed.data.d === 'string') return retryParsed.data.d;
        return JSON.stringify(retryParsed);
      } else if (String((response.data as any).success) === '1') {
        const parsed: any = response.data as any;
        if (typeof parsed?.data === 'string' && parsed.data) return parsed.data;
        if (parsed?.data && typeof parsed.data.d === 'string') return parsed.data.d;
        // Interceptor may already have parsed the inner object (id, name, title, pagectl...)
        return JSON.stringify(parsed);
      } else {
        throw new Error(response.data.message || 'Failed to get page data');
      }
    } catch (error) {
      console.error("🚀 ~ DevERPService ~ getPage ~ error:", error);
      throw error;
    }
  }

  /**
   * Get list data
   */
  async getListData(page: string, fromDate: string, toDate: string): Promise<string> {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }

      // First, try to get stored token from AsyncStorage if not available in memory
      if (!this.token || !this.tokenValidTill) {
        const storedToken = await AsyncStorage.getItem('erp_token');
        const storedTokenValidTill = await AsyncStorage.getItem('erp_token_valid_till');
        
        if (storedToken && storedTokenValidTill) {
          // Check if stored token is still valid
          const validTill = new Date(storedTokenValidTill);
          if (validTill > new Date()) {
            // Use stored token
            this.token = storedToken;
            this.tokenValidTill = storedTokenValidTill;
          } else {
            // Stored token expired, get new one
            await this.getAuth();
          }
        } else {
          // No stored token, get new one
          await this.getAuth();
        }
      } else {
        // Check if current token is still valid
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
      };

      const response = await apiClient.post<ListDataResponse>(
        `${this.link}msp_api.aspx/getListData`,
        listData
      );

      console.log("🚀 ~ DevERPService ~ getListData ~ response:", response);

      if (response.data.success === 0 && response.data.message?.includes('Token Expire')) {
        // Token expired, get new token and retry
        await this.getAuth();
        const retryResponse = await apiClient.post<ListDataResponse>(
          `${this.link}msp_api.aspx/getListData`,
          { token: this.token, page: page, fd: fromDate, td: toDate }
        );
        return retryResponse.data.data || '';
      } else if (response.data.success === 1) {
        return response.data.data || '';
      } else {
        throw new Error(response.data.message || 'Failed to get list data');
      }
    } catch (error) {
      console.error("🚀 ~ DevERPService ~ getListData ~ error:", error);
      throw error;
    }
  }

  /**
   * Initialize the service with stored data
   */
  async initialize(): Promise<void> {
    try {
      this.link = await AsyncStorage.getItem('erp_link') || '';
      this.token = await AsyncStorage.getItem('erp_token') || '';
      this.tokenValidTill = await AsyncStorage.getItem('erp_token_valid_till') || '';
      this.appid = await AsyncStorage.getItem('erp_appid') || '';
      
      console.log("🚀 ~ DevERPService ~ initialize ~ loaded token:", !!this.token);
      console.log("🚀 ~ DevERPService ~ initialize ~ token valid till:", this.tokenValidTill);
    } catch (error) {
      console.error("🚀 ~ DevERPService ~ initialize ~ error:", error);
    }
  }

  /**
   * Clear stored data
   */
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
      console.error("🚀 ~ DevERPService ~ clearData ~ error:", error);
    }
  }
}

export default new DevERPService();
