import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import wishlistReducer from './wishlistSlice';
import toastReducer from './toastSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishlist: wishlistReducer,
    toast: toastReducer,
    settings: settingsReducer,
  },
});

export default store;