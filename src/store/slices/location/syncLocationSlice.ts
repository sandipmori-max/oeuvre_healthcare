import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { syncLocationThunk } from './thunk';
import { SyncLocationResponse, SyncLocationState } from './type';

const initialState: SyncLocationState = {
  loading: false,
  error: null,
  response: null,
};

const syncLocationSlice = createSlice({
  name: 'syncLocation',
  initialState,
  reducers: {
    resetSyncLocationState: state => {
      state.loading = false;
      state.error = null;
      state.response = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(syncLocationThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        syncLocationThunk.fulfilled,
        (state, action: PayloadAction<SyncLocationResponse>) => {
          state.loading = false;
          state.response = action.payload;
        }
      )
      .addCase(syncLocationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSyncLocationState } = syncLocationSlice.actions;
export default syncLocationSlice.reducer;
