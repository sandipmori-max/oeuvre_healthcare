export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  status: 'checkin' | 'checkout';
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface AttendanceFormValues {
  name: string;
  email: string;
  status: 'checkin' | 'checkout';
  latitude: string;
  longitude: string;
  remark: string;
  dateTime: string;
}
