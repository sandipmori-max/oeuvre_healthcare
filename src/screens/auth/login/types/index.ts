export interface LoginFormProps {
  deviceId: string;
  isAddingAccount: boolean;
  isLoading: boolean;
  onLoginSuccess: (
    company_code: string,
    password: string,
    user_credentials: { user: string; name?: string },
    response: any
  ) => Promise<void>;
  showAlert: (config: {
    title: string;
    message: string;
    type: 'error' | 'success' | 'info';
  }) => void;
}
