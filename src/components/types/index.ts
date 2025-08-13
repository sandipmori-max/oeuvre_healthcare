export interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
}

export type DrawerItemConfig = {
  label: string;
  route: string;
  icon?: string;
};
