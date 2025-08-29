import { createAsyncThunk } from '@reduxjs/toolkit';
import { DevERPService } from '../../../services/api';

export const getAjaxThunk = createAsyncThunk<
  any,
  { dtlid: string; where: string, search: string },
  { rejectValue: string }
>(
  'ajax/getAjax',
  async ({ dtlid, where, search }, { rejectWithValue }) => {
    try {
      const response = await DevERPService.getAjax(dtlid, where, search);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch ajax data');
    }
  },
);
