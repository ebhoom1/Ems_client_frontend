import { createSlice } from '@reduxjs/toolkit';

const selectedUserSlice = createSlice({
  name: 'selectedUser',
  initialState: {
    userId: null, // Stores the selected user ID
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.userId = action.payload; // Set the selected user ID
    },
    
  },
});

export const { setSelectedUser } = selectedUserSlice.actions;

export default selectedUserSlice.reducer; // Correct default export
