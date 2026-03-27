import { DrawerItemConfig } from "../components/types";

export const ERP_DRAWER_LIST: DrawerItemConfig[] = [
  { label: "Home", route: "Home", icon: "home" },
  { label: "Attendance", route: "Attendance", icon: "calendar-month" },
  { label: "My Attendance", route: "MyAttendance", icon: "calendar-month" },
  // { label: "Business Card", route: "List", icon: "assignment" },
  // { label: 'Tasks', route: 'Tasks', icon: 'calendar-month' },
  // { label: 'File Manager', route: 'File Manager', icon: 'folder' },
  { label: "Notification", route: "Alert", icon: "notifications-active" },
  { label: "Privacy Policy", route: "Privacy Policy", icon: "policy" },
  { label: "Rate Our App", route: "AppRatting", icon: "star-half" },
  { label: "About us", route: "AboutUs", icon: "info" },
];

export enum EPermissionTypes {
  CAMERA = "camera",
}

export const ERP_APP_VERSION = "1.0.9";
