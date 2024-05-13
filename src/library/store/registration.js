import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { postMethod } from "../api";
import { RegisterUrl } from "../constant";

const initialState = {
  value: {
  isRegistered: false,
  registrationData: null,
  },
};

export const registerUser = createAsyncThunk(
  "registration/register",
  async (data, thunkAPI) => {
    try {
      const response = await postMethod(RegisterUrl, data);
      console.log("status code", response.status)
      if (response.status === 200) {
        // Assuming the response structure includes registration data
        return { isRegistered: true, registrationData: response.data };
      } else {
        return thunkAPI.rejectWithValue(response.data); // Handle non-200 status codes
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message); // Handle network errors or exceptions
    }
  }
);

// // Selector for isRegistered
const selectRegistration = (state) => state.registration;
export const selectIsRegistered = createSelector(
  [selectRegistration],
  (registration) => registration.value.isRegistered
);
//Adding Iselect

// const selectAuthenticationState = (state) => state.authentication;

// export const selectIsLogged = createSelector(
//   [selectAuthenticationState],
//   (authentication) => authentication.value.isLogged
// );


export const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    updateRegistration: (state, action) => {
      state.value.isRegistered = true;
      state.value.registrationData = action.payload;
    },
  },
  extraReducers: {
    [registerUser.fulfilled]: (state, action) => {
      state.value.isRegistered = true;
      state.value.registrationData = action.payload;
    },
    [registerUser.rejected]: (state) => {
      state.value.isRegistered = false;
      state.value.registrationData = null;
    },
    [registerUser.pending]: (state) => {
      state.value.isRegistered = false;
      state.value.registrationData = null;
    },
  },
});

export const { updateRegistration } = registrationSlice.actions;



// export const selectRegistrationState = (state) => state.registration.isRegistered;

// export const selectIsRegistered = createSelector(
//   [selectRegistrationState],
//   (registration) => registration.value.isRegistered
// );

export default registrationSlice.reducer;

