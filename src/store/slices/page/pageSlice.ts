// slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { savePageThunk, handlePageActionThunk } from './thunk';

interface PageState {
  loading: boolean;
  error: string | null;
  response: any | null;
}

const initialState: PageState = {
  loading: false,
  error: null,
  response: null,
};

const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    resetSavePageState: state => {
      state.loading = false;
      state.error = null;
      state.response = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(savePageThunk.pending, state => {
        state.loading = true;
        state.error = null;
        state.response = null;
      })
      .addCase(savePageThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(savePageThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(handlePageActionThunk.pending, state => {
        state.loading = true;
        state.error = null;
        state.response = null;
      })
      .addCase(handlePageActionThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(handlePageActionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSavePageState } = pageSlice.actions;
export default pageSlice.reducer;
