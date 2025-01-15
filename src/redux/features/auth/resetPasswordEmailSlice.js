import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../../utils/apiConfig';

// Async thunk to send the reset email link
export const sendResetLink = createAsyncThunk(
    'resetPasswordEmail/sendResetLink',
    async (email, { rejectWithValue }) => {
      try {
        const response = await axios.post(`${API_URL}/api/sendpasswordlink`, { email }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return response.data;
      } catch (error) {
        // Extract error message and status from the backend response
        const errorMessage = error.response?.data?.message || "Failed to send email";
        const errorStatus = error.response?.status || 500; // Default to 500 for unexpected errors
        return rejectWithValue({ message: errorMessage, status: errorStatus });
      }
    }
  );
  

// Slice for reset password email
const resetPasswordEmailSlice = createSlice({
  name: 'resetPasswordEmail',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendResetLink.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendResetLink.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendResetLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || "An error occurred";
      });
  },
});

export const { clearState } = resetPasswordEmailSlice.actions;

export default resetPasswordEmailSlice.reducer;
