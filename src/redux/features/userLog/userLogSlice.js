import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { LOCAL_API_URL, API_URL } from '../../../utils/apiConfig';

// Thunks
export const fetchUsers = createAsyncThunk(
  'userLog/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/getallusers`);
      return response.data.users;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'userLog/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/getauser/${userId}`);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const fetchUserByUserName = createAsyncThunk(
  'userLog/fetchUserByUserName',
  async(userName,{rejectWithValue})=>{
    try{
      const response = await axios.get(`${API_URL}/api/get-user-by-userName/${userName}`);
      return response.data.user;
    }catch(error){
      return rejectWithValue(error.response.data);
    }
  }  
);
export const fetchUserLatestByUserName = createAsyncThunk(
  'userLog/fetchUserLatestByUserName',
  async (userName, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/latest/${userName}`);
      return response.data.data; // Extract 'data' directly for use in the component
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching latest data.");
    }
  }
);
export const fetchUserByCompanyName = createAsyncThunk(
  'userLog/fetchUserByCompanyName',
  async(companyName,{rejectWithValue})=>{
    try{
      const response = await axios.get(`${API_URL}/api/get-user-by-companyName/${companyName}`);
      return response.data.user;
    }catch(error){
      return rejectWithValue(error.response.data);
    }
  }  
);
export const fetchStackNameByCompanyName = createAsyncThunk(
  'userLog/fetchStackNameByCompanyName',
  async (companyName, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/get-stacknames-by-companyName/${companyName}`);
      return response.data.stackNames;  // Assuming stackNames array is returned
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchStackNameByUserName = createAsyncThunk(
  'userLog/fetchStackNameByUserName',
  async (userName, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/get-stacknames-by-userName/${userName}`
      );
      console.log('API Response:', response.data); // Debugging

      // Ensure the stackNames array is correctly returned
      return response.data.stackNames || [];
    } catch (error) {
      console.error('Error fetching stack names:', error);
      return rejectWithValue(error.response?.data || 'An error occurred');
    }
  }
);


export const addUser = createAsyncThunk(
  'userLog/addUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/register`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.storeData;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addStackName = createAsyncThunk(
  'userLog/addStackName',
  async ({ companyName, stackData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/updateStackName/${companyName}`,
        { stackData }, // Correct payload key
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return response.data.user; // Assuming response contains updated user data
    } catch (error) {
      console.error('Error in addStackName thunk:', error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);




export const updateUser = createAsyncThunk(
  'userLog/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/api/edituser/${userId}`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


export const deleteUser = createAsyncThunk(
  'userLog/deleteUser',
  async (userName, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/api/deleteuser/${userName}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const userLogSlice = createSlice({
  name: 'userLog',
  initialState: {
    users: [],
    filteredUsers: [],
    selectedUser: null,
    stackNames: [], 
    latestUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    setFilteredUsers: (state, action) => {
      state.filteredUsers = action.payload;
    },
    clearState: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.filteredUsers = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = false;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add cases for fetchUserLatestByUserName
      .addCase(fetchUserLatestByUserName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserLatestByUserName.fulfilled, (state, action) => {
        state.loading = false;
        state.latestUser = action.payload; // Store the latest user data
      })
      .addCase(fetchUserLatestByUserName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch the latest user data';
      })
      .addCase(fetchUserByUserName.pending,(state)=>{
        state.loading = false;
      })
      .addCase(fetchUserByUserName.fulfilled,(state,action)=>{
        state.loading = false;
        state.users = action.payload ? [action.payload] : [];
      })
      .addCase(fetchUserByUserName.rejected,(state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserByCompanyName.pending,(state)=>{
        state.loading = false;
      })
      .addCase(fetchUserByCompanyName.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload; // Store the user object directly
    })
      .addCase(fetchUserByCompanyName.rejected,(state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Stack Names By CompanyName
      .addCase(fetchStackNameByCompanyName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStackNameByCompanyName.fulfilled, (state, action) => {
        state.loading = false;
        state.stackNames = action.payload; // Update the stackNames state with the fetched stack names
      })
      .addCase(fetchStackNameByCompanyName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStackNameByUserName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStackNameByUserName.fulfilled, (state, action) => {
        state.loading = false;
        state.stackNames = action.payload; // Update the stackNames state with the fetched stack names
      })
      .addCase(fetchStackNameByUserName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.userName !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // addStackName cases
       // Updated addStackName cases
       .addCase(addStackName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStackName.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedUser && state.selectedUser.companyName === action.payload.companyName) {
            state.selectedUser.stackName = action.payload.stackName; // Update stackName field
        }
    })
    
      .addCase(addStackName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});

export const { setFilteredUsers, clearState } = userLogSlice.actions;

export default userLogSlice.reducer;
