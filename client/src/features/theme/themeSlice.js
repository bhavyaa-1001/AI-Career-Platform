import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme,
  },
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload;
      applyTheme(action.payload);
    },
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      applyTheme(state.mode);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
