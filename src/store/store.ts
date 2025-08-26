import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/authSlice';
import themeReducer from './slices/theme/themeSlice';
import attendanceReducer from './slices/attandance/attendanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    attendance: attendanceReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
