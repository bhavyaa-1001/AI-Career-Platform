import { createSlice } from '@reduxjs/toolkit';

const loadSetting = (key, fallback) => {
  const stored = localStorage.getItem(`coding_${key}`);
  return stored ?? fallback;
};

const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    language: loadSetting('language', 'python'),
    fontSize: Number(loadSetting('fontSize', '14')),
    editorTheme: loadSetting('editorTheme', 'vs-dark'),
    isFullscreen: false,
    showLineNumbers: true,
    codeByProblem: {},
  },
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('coding_language', action.payload);
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
      localStorage.setItem('coding_fontSize', String(action.payload));
    },
    setEditorTheme: (state, action) => {
      state.editorTheme = action.payload;
      localStorage.setItem('coding_editorTheme', action.payload);
    },
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    setFullscreen: (state, action) => {
      state.isFullscreen = action.payload;
    },
    toggleLineNumbers: (state) => {
      state.showLineNumbers = !state.showLineNumbers;
    },
    setProblemCode: (state, action) => {
      const { problemId, code } = action.payload;
      state.codeByProblem[problemId] = code;
    },
    resetProblemCode: (state, action) => {
      delete state.codeByProblem[action.payload];
    },
  },
});

export const {
  setLanguage, setFontSize, setEditorTheme, toggleFullscreen, setFullscreen,
  toggleLineNumbers, setProblemCode, resetProblemCode,
} = editorSlice.actions;

export default editorSlice.reducer;
