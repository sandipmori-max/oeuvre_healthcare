import { createAsyncThunk } from '@reduxjs/toolkit';
import { DevERPService, AttendanceResponse } from '../../../services/api';

export const markAttendanceThunk = createAsyncThunk<
  AttendanceResponse, 
  { type: any,  rawData: any }, 
  { rejectValue: string }  
>(
  'attendance/markAttendance',
  async ({  rawData , type}, { rejectWithValue }) => {
    try {
      const response = await DevERPService.markAttendance(rawData, type);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to mark attendance');
    }
  },
);
