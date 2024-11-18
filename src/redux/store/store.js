import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/user/userSlice';
import userLogReducer from '../features/userLog/userLogSlice';
import resetPasswordReducer from '../features/auth/resetPassowordSlice';
import resetPasswordEmailReducer from '../features/auth/resetPasswordEmailSlice';
import CalibrationReducer from '../features/calibration/calibrationSlice';
import LatestIotDataReducer from '../features/iotData/iotDataSlice';
import calibrationExceedValueReducer from '../features/calibrationExceedValues/calibrationExceedValueSlice';
import transactionReducer from '../features/transactions/transactionSlice';
import selectedUserReducer from '../features/selectedUsers/selectedUserSlice'; // Ensure path is correct

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    userLog: userLogReducer,
    resetPassword: resetPasswordReducer,
    resetPasswordEmail: resetPasswordEmailReducer,
    calibration: CalibrationReducer,
    iotData: LatestIotDataReducer,
    calibrationExceedValue: calibrationExceedValueReducer,
    transactions: transactionReducer,
    selectedUser: selectedUserReducer,  // Use the updated selectedUser reducer
  },
});

export default store;
