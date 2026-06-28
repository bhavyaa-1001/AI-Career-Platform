import { configureStore } from '@reduxjs/toolkit';

import themeReducer from '@/features/theme/themeSlice';
import authReducer from '@/features/auth/authSlice';
import adminReducer from '@/features/admin/adminSlice';
import editorReducer from '@/features/coding/editorSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    admin: adminReducer,
    editor: editorReducer,
  },
  devTools: import.meta.env.DEV,
});
