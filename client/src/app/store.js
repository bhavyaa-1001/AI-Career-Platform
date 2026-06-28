import { configureStore } from '@reduxjs/toolkit';

import themeReducer from '@/features/theme/themeSlice';
import authReducer from '@/features/auth/authSlice';
import editorReducer from '@/features/coding/editorSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    editor: editorReducer,
  },
  devTools: import.meta.env.DEV,
});
