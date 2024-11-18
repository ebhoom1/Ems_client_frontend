import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';
import { LOCAL_API_URL,API_URL } from "../../../utils/apiConfig";


const url = 'http://localhost:5555';

export const addCalibration = createAsyncThunk(
    'calibration/addCalibration',
    async (calibrationData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/api/add-calibration`, calibrationData, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            return response.data.calibration;
        } catch (error) {
            return rejectWithValue(error.response.data?.message || error.message);
        }
    }
);

export const fetchCalibrations = createAsyncThunk(
    'calibration/fetchCalibrations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/view-all-calibrations`);
            return response.data.calibrations;
        } catch (error) {
            return rejectWithValue(error.response.data?.message || error.message);
        }
    }
);

export const fetchCalibrationById = createAsyncThunk(
    'calibration/fetchCalibrationById',
    async (calibrationId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/find-calibration-by-userId/${calibrationId}`);
            return response.data.calibration;
        } catch (error) {
            return rejectWithValue(error.response.data?.message || error.message);
        }
    }
);

export const deleteCalibration = createAsyncThunk(
    'calibration/deleteCalibration',
    async (calibrationId, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_URL}/api/delete-calibration/${calibrationId}`);
            return calibrationId;
        } catch (error) {
            return rejectWithValue(error.response.data?.message || error.message);
        }
    }
);

export const editCalibration = createAsyncThunk(
    'calibration/editCalibration',
    async ({ userName, updatedData }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${API_URL}/api/edit-calibration/${userName}`, updatedData);
            return response.data.calibration;
        } catch (error) {
            return rejectWithValue(error.response.data?.message || error.message);
        }
    }
);

const calibrationSlice = createSlice({
    name: 'calibration',
    initialState: {
        calibrationData: {
            adminID: "",
            adminName: "",
            dateOfCalibrationAdded: new Date().toISOString().slice(0, 10),
            timeOfCalibrationAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            userId: "",
            date: "",
            equipmentName: "",
            before: "",
            after: "",
            technician: "",
            notes: ""
        },
        userCalibrations: [],
        loading: false,
        error: null,
    },
    reducers: {
        updateCalibrationData(state, action) {
            state.calibrationData = {
                ...state.calibrationData,
                ...action.payload
            };
        },
        updateTimeOfCalibrationAdded(state, action) {
            state.calibrationData.timeOfCalibrationAdded = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCalibration.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addCalibration.fulfilled, (state, action) => {
                state.calibrationData = {
                    adminID: "",
                    adminName: "",
                    dateOfCalibrationAdded: "",
                    timeOfCalibrationAdded: "",
                    userId: "",
                    date: "",
                    equipmentName: "",
                    before: "",
                    after: "",
                    technician: "",
                    notes: ""
                };
                state.loading = false;
                state.error = null;
            })
            .addCase(addCalibration.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCalibrations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCalibrations.fulfilled, (state, action) => {
                state.userCalibrations = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchCalibrations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCalibrationById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCalibrationById.fulfilled, (state, action) => {
                state.calibrationData = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchCalibrationById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteCalibration.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCalibration.fulfilled, (state, action) => {
                state.userCalibrations = state.userCalibrations.filter(calibration => calibration._id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteCalibration.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(editCalibration.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(editCalibration.fulfilled, (state, action) => {
                const index = state.userCalibrations.findIndex(calibration => calibration._id === action.payload._id);
                if (index !== -1) {
                    state.userCalibrations[index] = action.payload;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(editCalibration.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { updateCalibrationData, updateTimeOfCalibrationAdded } = calibrationSlice.actions;

export default calibrationSlice.reducer;