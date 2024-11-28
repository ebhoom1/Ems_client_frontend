import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../../utils/apiConfig';

// Thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, userType }, { rejectWithValue }) => {
    try {
      // Sending login request to backend
      const response = await axios.post(`${API_URL}/api/login`, { email, password, userType });
      
      // Extracting user details and token from backend response
      const { userValid: user, token } = response.data.result;

      // Storing the token in localStorage
      localStorage.setItem('userdatatoken', token);

      // Returning user and token data for Redux store
      return { user, token };
    } catch (error) {
      console.error("Login API Error:", error.response?.data || error.message || error);
      // Reject the value with the backend-provided error message or a default one
      return rejectWithValue(error.response?.data?.error || "Something went wrong!");
    }
  }
);

// Redux slice for authentication
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null, // Holds user details including adminType and userType
    token: null, // Holds the auth token
    loading: false, // Tracks loading state for login
    error: null, // Holds error messages for login failures
    isSidebarActive: false, // Tracks sidebar state
  },
  reducers: {
    // Logout reducer
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('userdatatoken'); // Clear the token from localStorage
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // Store user details
        state.token = action.payload.token; // Store the auth token
        localStorage.setItem('userdatatoken', action.payload.token); // Ensure the token is stored
        console.log("User:", action.payload.user);
        console.log("Token stored in localStorage:", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Store error messages for display
      });
  }
});

// Exporting actions and reducer
export const { logout } = authSlice.actions;
export default authSlice.reducer;
