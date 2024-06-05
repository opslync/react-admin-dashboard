import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postMethod } from '../api';
import { RegisterUrl, registerUrl } from '../constant';

export const registerUser = createAsyncThunk('registration/registerUser', async (data) => {
  const response = await postMethod(RegisterUrl, data);
  console.log("response from registrer ", response.data)
  return response.data;
});

const registrationSlice = createSlice({
  name: 'registration',
  initialState: {
    isRegistered: false,
    registrationData: null,
    error: null,
  },
  reducers: {
    resetRegistration: (state) => {
      state.isRegistered = false;
      state.registrationData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isRegistered = true;
        state.registrationData = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isRegistered = false;
        state.error = action.error.message;
      });
  },
});

export const { resetRegistration } = registrationSlice.actions;
export const selectIsRegistered = (state) => state.registration.isRegistered;
export default registrationSlice.reducer;
