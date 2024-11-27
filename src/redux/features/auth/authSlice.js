import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../../utils/apiConfig';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, userType }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/login`, { email, password, userType });
      const { user, token } = response.data;
      localStorage.setItem('userdatatoken', token);
      return { user, token };
    } catch (error) {
      console.error("Login API Error:", error.response?.data || error.message || error);
      return rejectWithValue(error.response?.data?.error || "Something went wrong!");
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
    isSidebarActive: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('userdatatoken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
         // Store token in localStorage
        localStorage.setItem('userdatatoken', action.payload.token);
        console.log("Token stored in localStorage:", action.payload.token);

      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
