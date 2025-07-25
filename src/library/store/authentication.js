import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUrl, baseUrl } from "../constant";
import { createSelector } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  value: {
    isLogged: false,
    loginData: null,
    token: localStorage.getItem("token") || null, // Initialize token from localStorage if available
  },
};

// export const authenticateUser = createAsyncThunk(
//   "authentication/user",
//   async (data, thunkAPI) => {
//     const response = await postMethod(loginUrl, data);
//     return response;
//   }
// );

export const authenticateUser = createAsyncThunk(
  "authentication/user",
  async (data, thunkAPI) => {
    try {
      const response = await axios.post(loginUrl, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        return { isLogged: true, username: response.data.user.username, token: response.data.token };
      } else {
        return thunkAPI.rejectWithValue(response.data);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

//Adding Iselect

const selectAuthenticationState = (state) => state.authentication;

export const selectIsLogged = createSelector(
  [selectAuthenticationState],
  (authentication) => authentication.value.isLogged
);


////

export const authenticationSlice = createSlice({
  name: "authentication",
  initialState,
  reducers: {
  //   updateUser: (state, action) => {
  //     // console.log("Update User Action Payload:", action.payload.token); //debuging
  //     state.value = {
  //       isLogged: action.payload.isLogged,
  //       username: action.payload.username,
  //       token: action.payload.token, // Assuming token is provided in updateUser action payload
  //     };
  //       localStorage.setItem("token", action.payload.token); // Store token in localStorage if it exists
  //       localStorage.setItem("username", action.payload.username);
  //   },
  // },
  updateUser: (state, action) => {
    state.value.isLogged = action.payload.isLogged;
    state.value.username = action.payload.username;
    state.value.token = action.payload.token;
    localStorage.setItem("token", action.payload.token);
    localStorage.setItem("username", action.payload.username);
    },
  },
  extraReducers: {
    [authenticateUser.fulfilled]: (state, action) => {
      // console.log("Update User Action Payload:", action.payload.isLogged); //debuging
      state.value.isLogged = true;
      state.value.username = action.payload.username;
      state.value.token = action.payload.token || null;
      localStorage.setItem("token", action.payload.token); // Store token in localStorage if it exists
      localStorage.setItem("username", action.payload.username);
    },
    [authenticateUser.rejected]: (state, action) => {
      state.value.isLogged = false;
      state.value.username = null;
      state.value.token = null;
      localStorage.removeItem("token");
    },
    [authenticateUser.pending]: (state, action) => {
      state.value.isLogged = false;
      state.value.username = null;
      state.value.token = null;
      localStorage.removeItem("token");
    },
  },
});

export const { updateUser } = authenticationSlice.actions;

export default authenticationSlice.reducer;









