import { createSlice } from '@reduxjs/toolkit';

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: {
    value: false,
  },
  reducers: {
    openSideBar: (state) => {
      state.value = true;
    },
    closeSideBar: (state) => {
      state.value = false;
    },
  },
});

export const { openSideBar, closeSideBar } = sidebarSlice.actions;

export default sidebarSlice.reducer;
