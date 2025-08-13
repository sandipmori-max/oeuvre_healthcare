import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export interface ThemeState {
  isDarkMode: boolean;
}

const initialState: ThemeState = {
  isDarkMode: false,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;

export const selectIsDarkMode = (state: RootState) => state.theme.isDarkMode;

export default themeSlice.reducer;