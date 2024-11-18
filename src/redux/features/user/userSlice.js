import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { LOCAL_API_URL, API_URL } from '../../../utils/apiConfig';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('userdatatoken');
      console.log('Sending request to fetch user with token:', token); 
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get(`${API_URL}/api/validuser`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
      });
      console.log('User data response:', response.data);  // Log the response
      return response.data;
    } catch (error) {
     
      console.error('Error logging out:', error.response ? error.response.data : error.message);  // Log the error
      return rejectWithValue(error.response ? error.response.data : { message: error.message });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('userdatatoken');
      console.log('Sending request to logout with token:', token); 
      if (!token) {
        throw new Error('No token found');
      } 
      const response = await axios.get(`${API_URL}/api/logout`, {
        headers: {
          'Content-Type': "application/json",
          'Authorization': token,
          Accept: 'application/json'
        },
        withCredentials: true
      });
      console.log('Logout response:', response.data);  // Log the response
      if (response.data.status === 201) {
        localStorage.removeItem('userdatatoken');
        dispatch(logout());
        return response.data;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error) {
      console.error('Error logging out:', error.response ? error.response.data : error.message);  // Log the error
      return rejectWithValue(error.response ? error.response.data : { message: error.message });
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    loading: false,
    error: null,
    userType: '',
  },
  reducers: {
    logout: (state) => {
      state.userData = null;
      state.userType = '';
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.userType = action.payload.validUserOne.userType;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;
