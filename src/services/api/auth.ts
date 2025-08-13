import apiClient from './config';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  UserProfile,
  UpdateProfileRequest,
  DevERPRequest,
  DevERPResponse,
} from './types';

class AuthService {
  private readonly baseUrl = '/devws';

  /**
   * Get application link for specific code (like payroll)
   */
  async getAppLink(code: string): Promise<DevERPResponse> {
    try {
      const response = await apiClient.post<DevERPResponse>(
        `${this.baseUrl}/appcode.aspx/getLink`,
        { code }
      );
      console.log("🚀 ~ AuthService ~ getAppLink ~ response:", response);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user with company code and password
   * This would be implemented based on your actual login endpoint
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // First get the app link for the company code
      const appResponse = await this.getAppLink(credentials.company_code);
      
      if (appResponse.success === 1 && appResponse.link) {
        // Use the returned link for login
        const loginUrl = `${appResponse.link}auth/login`;
        
        const response = await apiClient.post<LoginResponse>(
          loginUrl,
          credentials
        );
        console.log("🚀 ~ AuthService ~ login ~ response:", response);
        return response.data;
      } else {
        throw new Error('Invalid company code or application not found');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await apiClient.post<RefreshTokenResponse>(
        `${this.baseUrl}/auth/refresh`,
        { refreshToken }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user and invalidate tokens
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/auth/logout`, { refreshToken });
    } catch (error) {
      // Even if logout fails, we should still clear local tokens
      console.warn('Logout API call failed:', error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>(`${this.baseUrl}/auth/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await apiClient.put<UserProfile>(
        `${this.baseUrl}/auth/profile`,
        profileData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/auth/change-password`,
        {
          currentPassword,
          newPassword,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Forgot password request
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/auth/forgot-password`,
        { email }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/auth/reset-password`,
        {
          token,
          newPassword,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/auth/verify-email`,
        { token }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${this.baseUrl}/auth/resend-verification`,
        { email }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
