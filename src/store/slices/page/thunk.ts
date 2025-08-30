import { createAsyncThunk } from '@reduxjs/toolkit';
import { DevERPService } from '../../../services/api';

export const savePageThunk = createAsyncThunk<
  any,
  { page: string; id: string; data: any },
  { rejectValue: string }
>('savePage/save', async ({ page, id, data }, { rejectWithValue }) => {
  try {
    const response = await DevERPService.savePage(page, id, data);
    return response;
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to save page');
  }
});

export const handlePageActionThunk = createAsyncThunk<
  any,
  {
    action: 'pageAuth' | 'pageDeAuth' | 'pageDelete' | 'pageCancel';
    id: string;
    remarks: string;
    page: string;
  },
  { rejectValue: string }
>('page/action', async ({ action, id, remarks, page }, { rejectWithValue }) => {
  try {
    const response = await DevERPService.handlePageAction(action, id, remarks, page);
    return response;
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to perform page action');
  }
});
