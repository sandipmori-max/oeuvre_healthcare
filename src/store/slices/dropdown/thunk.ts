import { createAsyncThunk } from '@reduxjs/toolkit';
import { DevERPService } from '../../../services/api';

export const getDDLThunk = createAsyncThunk<
  any,
  { dtlid: string; where: string },
  { rejectValue: string }
>(
  'dropdown/getDDL',
  async ({ dtlid, where }, { rejectWithValue }) => {
    try {
      const response = await DevERPService.getDDL(dtlid, where);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch dropdown');
    }
  },
);
