import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../../utils/apiConfig';

export const fetchLatestIotData = createAsyncThunk(
    'iotData/fetchLatestIotData',
    async (userName, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/latest-iot-data/${userName}`);
            return response.data.data[0] || {};
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const    fetchIotDataByUserName = createAsyncThunk(
    'iotData/fetchIotDataByUserName',
    async (userName, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/get-IoT-Data-by-userName/${userName}`);
            const data = response.data.data;

            if (!data || data.length === 0) {
                return rejectWithValue({ message: `No data found for ${userName}` });
            }
            const latestEntry = data.reduce((latest, current) => {
                return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
            }, data[0]);

            return latestEntry || { message: `No data found for ${userName}` };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchIotDataByCompanyName = createAsyncThunk(
    'iotData/fetchIotDataByCompanyName',
    async (companyName, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/get-IoT-Data-by-companyName/${companyName}`);
            const data = response.data.data;

            if (!data || data.length === 0) {
                return rejectWithValue({ message: `No data found for ${companyName}` });
            }
            const latestEntry = data.reduce((latest, current) => {
                return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
            }, data[0]);

            return latestEntry || { message: `No data found for ${companyName}` };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);


export const fetchIotDataByUserNameAndStackName = createAsyncThunk(
    'iotData/fetchIotDataByUserNameAndStackName',
    async ({ userName, stackName }, { rejectWithValue }) => {
      try {
        // Assuming the API endpoint for fetching data looks something like this
        const response = await axios.get(`${API_URL}/api/get-IoT-Data-by-userName-and-stackName/${userName}/${stackName}`);
        
          return response.data;
       
      } catch (error) {
        // Handle and return error
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch IoT data');
      }
    }
  );
  export const fetchIotDataByCompanyNameAndStackName = createAsyncThunk(
    'iotData/fetchIotDataByCompanyNameAndStackName',
    async ({ companyName, stackName }, { rejectWithValue }) => {
      try {
        // Assuming the API endpoint for fetching data looks something like this
        const response = await axios.get(`${API_URL}/api/iot/get-IoT-Data-by-companyName-and-stackName/${companyName}/${stackName}`);
        
        // Check if the response is valid
        if (response.status === 200) {
          return response.data;
        } else {
          // Return a rejectWithValue if the response status is not 200
          return rejectWithValue('Error fetching IoT data');
        }
      } catch (error) {
        // Handle and return error
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch IoT data');
      }
    }
  );
export const fetchAverageDataByUserName = createAsyncThunk(
    'iotData/fetchAverageDataByUserName',
    async ({ userName, interval }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/averageData/${userName}?interval=${interval}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
  );
  
export const fetchDifferenceDataByUserName = createAsyncThunk(
    'iotData/fetchDifferenceDataByUserName',
    async (userName, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/api/differenceData/${userName}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);
const iotDataSlice = createSlice({
    name: 'iotData',
    initialState: {
        latestData: {},
        userIotData: {},
        averageData: [],
        stackData: {},
        differenceData: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLatestIotData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLatestIotData.fulfilled, (state, action) => {
                state.loading = false;
                state.latestData = action.payload;
            })
            .addCase(fetchLatestIotData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchIotDataByUserName.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIotDataByUserName.fulfilled, (state, action) => {
                state.loading = false;
                state.userIotData = action.payload;
            })
            .addCase(fetchIotDataByUserName.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchIotDataByCompanyName.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIotDataByCompanyName.fulfilled, (state, action) => {
                state.loading = false;
                state.userIotData = action.payload;
            })
            .addCase(fetchIotDataByCompanyName.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchIotDataByUserNameAndStackName.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIotDataByUserNameAndStackName.fulfilled, (state, action) => {
                state.loading = false;
                state.stackData = action.payload;  // Save the fetched stack-specific data
            })
            .addCase(fetchIotDataByUserNameAndStackName.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchIotDataByCompanyNameAndStackName.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIotDataByCompanyNameAndStackName.fulfilled, (state, action) => {
                state.loading = false;
                state.stackData = action.payload;  // Save the fetched stack-specific data
            })
            .addCase(fetchIotDataByCompanyNameAndStackName.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAverageDataByUserName.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAverageDataByUserName.fulfilled, (state, action) => {
                state.loading = false;
                state.averageData = action.payload;
            })
            .addCase(fetchAverageDataByUserName.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchDifferenceDataByUserName.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDifferenceDataByUserName.fulfilled, (state, action) => {
                state.loading = false;
                state.differenceData = action.payload;
            })
            .addCase(fetchDifferenceDataByUserName.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
           
    }
});

export default iotDataSlice.reducer;