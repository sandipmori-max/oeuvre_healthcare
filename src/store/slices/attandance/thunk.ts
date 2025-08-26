import { createAsyncThunk } from '@reduxjs/toolkit';
import { DevERPService, AttendanceResponse } from '../../../services/api';

export const markAttendanceThunk = createAsyncThunk<
  AttendanceResponse, 
  { page: string; rawData: any }, 
  { rejectValue: string }  
>(
  'attendance/markAttendance',
  async ({ page, rawData }, { rejectWithValue }) => {
    try {
      const response = await DevERPService.markAttendance(page, rawData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to mark attendance');
    }
  },
);
