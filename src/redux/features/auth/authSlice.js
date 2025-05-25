import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../../utils/apiConfig';

// Thunk for user/operator login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, userType }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        email,
        password,
        userType
      });

      const data = response.data;

      const user  = data.result?.user || null;
      const token = data.result?.token || data.token || null;

      if (!user || !token) {
        throw new Error("Login failed: Missing user or token");
      }

      localStorage.setItem('userdatatoken', token);
      return { user, token };
    } catch (err) {
      console.error('Login API Error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.error || err.response?.data?.message || 'Something went wrong!'
      );
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
    isSidebarActive: false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('userdatatoken');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload.user;
        state.token   = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;