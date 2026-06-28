import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  selectedUserIds: [],
  filters: {},
  activeModule: 'dashboard',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    setSelectedUserIds: (state, action) => { state.selectedUserIds = action.payload; },
    toggleUserSelection: (state, action) => {
      const id = action.payload;
      const idx = state.selectedUserIds.indexOf(id);
      if (idx >= 0) state.selectedUserIds.splice(idx, 1);
      else state.selectedUserIds.push(id);
    },
    clearSelection: (state) => { state.selectedUserIds = []; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setActiveModule: (state, action) => { state.activeModule = action.payload; },
  },
});

export const {
  toggleSidebar, setSidebarOpen, setSelectedUserIds, toggleUserSelection,
  clearSelection, setFilters, setActiveModule,
} = adminSlice.actions;

export default adminSlice.reducer;
