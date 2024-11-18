import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import { LOCAL_API_URL,API_URL } from "../../../utils/apiConfig";

export const addCalibrationExceedValue = createAsyncThunk(
    'calibrationExceedValue/addCalibrationExceedValue',
    async(calibrationExceedValue,{rejectWithValue})=>{
        try {
            const response = await axios.post(`${API_URL}/api/add-calibration-values`,calibrationExceedValue,{
                headers:{
                    "Content-Type":"application/json"
                }
            })
            return response.data.calibrationExceedValues
        } catch (error) {
            return rejectWithValue(error.response.data?.message || error.message);
        }
    }
)
export const setCurrentDateTime = createAsyncThunk(
    'calibrationExceedValue/setCurrentDateTime',
    async (_, { rejectWithValue }) => {
        try {
            const currentDateTime = new Date().toISOString();
            return currentDateTime;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchAllCalibrationExceedValues =createAsyncThunk(
    'calibrationExceedValue/fetchAllCalibrationExceedValues',
    async(_,{rejectWithValue})=>{
        try {
            const response = await axios.get(`${API_URL}/api/get-all-calibration-values`)
            console.log("API Response:", response.data); // Added log
            return response.data.calibrationExceedValues
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message)
        }
    }
)
export const fetchCalibrationExceedValueByUserId = createAsyncThunk(
    `calibrationExceedValue/fetchCalibrationExceedValueByUserId`,
    async(userName,{rejectWithValue})=>{
        try {
            const response = await axios.get(`${API_URL}/api/get-calibration-values/${userName}`)
            return response.data.userCalibrationExceedValues[0] 
        } catch (error) {
            return rejectWithValue(error.response.data?.message || error.message);
        }
    }
)

export const editCalibrationExceedValue = createAsyncThunk(
    'calibrationExceedValue/editCalibrationExceedValue',
    async({userName,updateData},{rejectWithValue})=>{
        try {
            const response =await axios.patch(`${API_URL}/api/edit-calibration-values/${userName}`,updateData);
            return response.data.calibrationExceedValue;
        } catch (error) {
            return rejectWithValue(error.response.data?.message || error.message);
        }
    }
)

export const deleteCalibrationExceedValue =createAsyncThunk(
    'calibrationExceedValue/deleteCalibrationExceedValue',
    async(calibrationExceedvalueId,{rejectWithValue})=>{
        try {
            await axios.delete(`${API_URL}/api/delete-calibration-values/${calibrationExceedvalueId}`);
            return calibrationExceedvalueId;
        } catch (error) {
            return rejectWithValue(error.response.data?.message || error.message);
        }
    }
)
const calibrationExceedValueSlice= createSlice({
    name:'calibrationExceedValue',
    initialState: {
        calibrationExceedValueData: {
            adminUserName: "",
            adminName: "",
            userName: "",
            date: new Date().toISOString().slice(0, 10),
            product_id: "",
            industryType:"",
            phBelow: "",
            phAbove:"",
            TSS: "",
            turbidity: "",
            temperature: "",
            COD: "",
            BOD: "",
            TDS: "",
            ORP: "",
            nitrate: "",
            ammonicalNitrogen: "",
            DO: "",
            chloride: "",
            Flow:"",
            CO:"",
            NOX:"",
            Pressure:"",
            PM:"",
            SO2:"",
            NO2:"",
            Mercury:"",
            PM10: "",
            PM25: "",
            NOH: "",
            NH3: "",
            WindSpeed: "",
            WindDir: "",
            AirTemperature: "",
            Humidity: "",
            solarRadiation: "",
            DB: ""
        },
        allCalibrationExceedValues:[],
        calibrationExceedValues: [],
        userCalibrationExceedValues: null,
        loading: false,
        error: null,
        currentDateTime: new Date().toISOString()
    },
    reducers:{
        updateCalibrationExceedValueData(state, action) {
            state.calibrationExceedValueData = {
                ...state.calibrationExceedValueData,
                ...action.payload
            };
        },
        updateTimeOfCalibrationExceedValueAdded(state, action) {
            state.calibrationExceedValueData.timeOfCalibrationExceedValueAdded = action.payload;
        }
    },


 extraReducers: (builder) => {
        builder
            .addCase(addCalibrationExceedValue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addCalibrationExceedValue.fulfilled, (state, action) => {
                state.calibrationExceedValues.push(action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(addCalibrationExceedValue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAllCalibrationExceedValues.pending,(state)=>{
                state.loading =true;
                state.error = null;
            })
            .addCase(fetchAllCalibrationExceedValues.fulfilled,(state,action)=>{
                state.allCalibrationExceedValues = action.payload;
                state.loading = false;
                state.error =null;
            })
            .addCase(fetchAllCalibrationExceedValues.rejected,(state,action)=>{
                state.loading =false;
                state.error =action.payload;
            })
            .addCase(fetchCalibrationExceedValueByUserId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCalibrationExceedValueByUserId.fulfilled, (state, action) => {
                state.userCalibrationExceedValues = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchCalibrationExceedValueByUserId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteCalibrationExceedValue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCalibrationExceedValue.fulfilled, (state, action) => {
                state.calibrationExceedValues = state.calibrationExceedValues.filter(value => value._id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteCalibrationExceedValue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(editCalibrationExceedValue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(editCalibrationExceedValue.fulfilled, (state, action) => {
                const index = state.calibrationExceedValues.findIndex(value => value._id === action.payload._id);
                if (index !== -1) {
                    state.calibrationExceedValues[index] = action.payload;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(editCalibrationExceedValue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            builder.addCase(setCurrentDateTime.fulfilled, (state, action) => {
                state.currentDateTime = action.payload;
            });
    }
});

export const { updateCalibrationExceedValueData, updateTimeOfCalibrationExceedValueAdded } = calibrationExceedValueSlice.actions;

export default calibrationExceedValueSlice.reducer;