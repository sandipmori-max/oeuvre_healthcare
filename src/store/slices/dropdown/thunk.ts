import { createAsyncThunk } from '@reduxjs/toolkit';
import { DevERPService } from '../../../services/api';

export const getDDLThunk = createAsyncThunk<
  any,
  { dtlid: string; ddlwhere: string },
  { rejectValue: string }
>(
  'dropdown/getDDL',
  async ({ dtlid, ddlwhere }, { rejectWithValue }) => {
    try {
      const response = await DevERPService.getDDL(dtlid, ddlwhere);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch dropdown');
    }
  },
);
