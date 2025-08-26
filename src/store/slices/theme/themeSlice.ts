import { createSlice } from '@reduxjs/toolkit';
import { Appearance } from 'react-native';

type ThemeState = 'light' | 'dark';

const initialState: ThemeState = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: state => (state === 'light' ? 'dark' : 'light'),
    setTheme: (_, action) => action.payload,
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
