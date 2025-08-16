export interface LoginFormProps {
  appId: string;
  deviceId: string;
  isAddingAccount: boolean;
  isLoading: boolean;
  onLoginSuccess: (
    company_code: string,
    password: string,
    user_credentials: { user: string; name?: string },
  ) => Promise<void>;
  showAlert: (config: {
    title: string;
    message: string;
    type: 'error' | 'success' | 'info';
  }) => void;
}
