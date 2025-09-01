import { createAsyncThunk } from '@reduxjs/toolkit';
import { DevERPService, AttendanceResponse } from '../../../services/api';

export const markAttendanceThunk = createAsyncThunk<
  AttendanceResponse, 
  { type: any,  rawData: any, user: any }, 
  { rejectValue: string }  
>(
  'attendance/markAttendance',
  async ({  rawData , type, user}, { rejectWithValue }) => {
    try {
      const response = await DevERPService.markAttendance(rawData, type, user);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to mark attendance');
    }
  },
);

export const getLastPunchInThunk = createAsyncThunk<
  AttendanceResponse,
  void,
  { rejectValue: string }
>('attendance/getLastPunchIn', async (_, { rejectWithValue }) => {
  try {
    const response = await DevERPService.getLastPunchIn();
    console.log("🚀 ~ response:", response)
    return response;
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to fetch last punch-in');
  }
});
