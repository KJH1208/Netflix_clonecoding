import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null,
  type: 'success', // 'success', 'error', 'info'
  isVisible: false,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type || 'success';
      state.isVisible = true;
    },
    hideToast: (state) => {
      state.isVisible = false;
      state.message = null;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;