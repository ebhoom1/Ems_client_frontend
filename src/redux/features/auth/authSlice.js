import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { LOCAL_API_URL,API_URL } from '../../../utils/apiConfig';





export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, userType }, { rejectWithValue }) => {
    try {
            const response = await axios.post(`${API_URL}/api/login`, { email, password, userType });
     
        localStorage.setItem('userdatatoken', response.data.result.token);
        console.log('userdatatoken',response.data.result.token);
        console.log('user details from authSlice:',response.data.result.userValid.userType);
      
      return response.data.result.userValid;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isSidebarActive: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('userdatatoken');
    },
    
  
},
  extraReducers:(builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
