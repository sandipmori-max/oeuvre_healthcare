import { createAsyncThunk } from '@reduxjs/toolkit';
import { DevERPService } from '../../../services/api';
import { SyncLocationResponse } from './type';

export const syncLocationThunk = createAsyncThunk<
  SyncLocationResponse,
  { token: string, location: string },
  { rejectValue: string }
>('syncLocation/sync', async ({token, location }, { rejectWithValue }) => {
  try {
    const response = await DevERPService.syncLocation(token,location);
    return response;
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to sync location');
  }
});
