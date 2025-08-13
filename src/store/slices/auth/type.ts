// User interface
export interface User {
  id: string;
  name: string;
  company_code: string;
  avatar?: string;
  accountType?: string;
  token?: string;
  tokenValidTill?: string;
}

// Account interface for storing multiple accounts
export interface Account {
  id: string;
  user: User;
  isActive: boolean;
  lastLoginAt: string;
}

// Menu interface
export interface MenuItem {
  id: string;
  name: string;
  url?: string;
  icon?: string;
  children?: MenuItem[];
  title?: string;
  isReport?: boolean;
}

// Dashboard interface
export interface DashboardItem {
  id: string;
  name: string;
  data: string;
  url?: string;
  title: string;
  isReport: boolean;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  accounts: Account[];
  activeAccountId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  menu: MenuItem[];
  isMenuLoading: boolean;
  dashboard: DashboardItem[];
  isDashboardLoading: boolean;
}