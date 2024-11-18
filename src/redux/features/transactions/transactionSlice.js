import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { LOCAL_API_URL,API_URL } from "../../../utils/apiConfig";

// Async thunk to fetch all transactions
export const fetchAllTransactions = createAsyncThunk(
    'transactions/fetchAll',
    async (_,{rejectWithValue}) => {
        try {
            const response = await axios.get(`${API_URL}/api/transactions`);
            return response.data.transactions;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message)
        }
      
    }
  );

  // Async thunk to fetch transactions by username
export const fetchTransactionsByUserName = createAsyncThunk(
    'transactions/fetchByUserName',
    async (userName,{rejectWithValue}) => {
    try {
       
            const response = await axios.get(`${API_URL}/api/transaction-by-user/${userName}`);
            return response.data.transaction ? [response.data.transaction] : [];
          
    } catch (error) {
        return rejectWithValue(error.response.data?.message || error.message);

    }
}
  );

  const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
      transactions: [],
      status: 'idle',
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchAllTransactions.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchAllTransactions.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.transactions = action.payload;
        })
        .addCase(fetchAllTransactions.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        })
        .addCase(fetchTransactionsByUserName.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchTransactionsByUserName.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.transactions = action.payload;
        })
        .addCase(fetchTransactionsByUserName.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        });
    },
  });
  
  export default transactionSlice.reducer;