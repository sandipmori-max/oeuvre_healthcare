import { createAsyncThunk } from '@reduxjs/toolkit';
import { DevERPService } from '../../../services/api';

export const getAjaxThunk = createAsyncThunk<
  any,
  { dtlid: string; where: string },
  { rejectValue: string }
>(
  'ajax/getAjax',
  async ({ dtlid, where }, { rejectWithValue }) => {
    try {
      const response = await DevERPService.getAjax(dtlid, where);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch ajax data');
    }
  },
);
