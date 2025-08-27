import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getDDLThunk } from './thunk';

interface DropdownState {
  loading: boolean;
  error: string | null;
  response: any | null;
}

const initialState: DropdownState = {
  loading: false,
  error: null,
  response: null,
};

const dropdownSlice = createSlice({
  name: 'dropdown',
  initialState,
  reducers: {
    resetDropdownState: state => {
      state.loading = false;
      state.error = null;
      state.response = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getDDLThunk.pending, state => {
        state.loading = true;
        state.error = null;
        state.response = null;
      })
      .addCase(getDDLThunk.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(getDDLThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetDropdownState } = dropdownSlice.actions;
export default dropdownSlice.reducer;
