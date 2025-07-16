import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: false,
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
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