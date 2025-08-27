import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getAjaxThunk } from './thunk';

interface AjaxState {
  loading: boolean;
  error: string | null;
  response: any | null;
}

const initialState: AjaxState = {
  loading: false,
  error: null,
  response: null,
};

const ajaxSlice = createSlice({
  name: 'ajax',
  initialState,
  reducers: {
    resetAjaxState: state => {
      state.loading = false;
      state.error = null;
      state.response = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getAjaxThunk.pending, state => {
        state.loading = true;
        state.error = null;
        state.response = null;
      })
      .addCase(getAjaxThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(getAjaxThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetAjaxState } = ajaxSlice.actions;
export default ajaxSlice.reducer;
