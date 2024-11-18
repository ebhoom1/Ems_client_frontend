import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'
import { LOCAL_API_URL,API_URL } from '../../../utils/apiConfig';



export const sendResetLink = createAsyncThunk(
    'resetPasswordEmail/sendResetLink',
    async(email,{rejectWithValue})=>{
        try {
            const response = await axios.post(`${API_URL}/api/sendpasswordlink`,{email},{
                headers:{
                    'Content-Type':'application/json'
                }
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data)            
        }
    }
)

const resetPasswordEmailSlice = createSlice({
    name:'resetPasswordEmail',
    initialState:{
        loading:false,
        error:null,
        success:false
    },
    reducers:{
        clearState:(state)=>{
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    },
    extraReducers:(builder)=>{
        builder
        
        .addCase(sendResetLink.pending,(state)=>{
            state.loading = true;
            state.error = null;
            state.success = false;
        })
        .addCase(sendResetLink.fulfilled,(state)=>{
            state.loading = false;
            state.success = true;
        })
        .addCase(sendResetLink.rejected,(state,action)=>{
            state.loading =false;
            state.error = action.payload;
        });
    }
});

export const {clearState} = resetPasswordEmailSlice.actions;

export default resetPasswordEmailSlice.reducer;