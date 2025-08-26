import { ViewStyle } from "react-native";

export interface ERPIconProps {
  name: string;
  isMenu?: boolean;
  onPress?: () => void;
  extStyle?: ViewStyle | ViewStyle[];
  extSize?: number;
  color?: string;
}