import { createAsyncThunk } from '@reduxjs/toolkit';
import { DevERPService } from '../../../services/api';

export const getAjaxThunk = createAsyncThunk<
  any,
  { dtlid: string; ddlwhere: string },
  { rejectValue: string }
>(
  'ajax/getAjax',
  async ({ dtlid, ddlwhere }, { rejectWithValue }) => {
    try {
      const response = await DevERPService.getAjax(dtlid, ddlwhere);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch ajax data');
    }
  },
);
