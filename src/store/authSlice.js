import { createSlice } from '@reduxjs/toolkit';

// 초기 상태를 localStorage에서 불러오기
const initialState = {
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
  currentUser: localStorage.getItem('currentUser') || null,
  rememberMe: localStorage.getItem('rememberMe') === 'true',
  savedEmail: localStorage.getItem('savedEmail') || '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { email, rememberMe } = action.payload;
      state.isLoggedIn = true;
      state.currentUser = email;
      state.rememberMe = rememberMe;
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', email);
      
      if (rememberMe) {
        state.savedEmail = email;
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', email);
      } else {
        state.savedEmail = '';
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedEmail');
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.currentUser = null;
      
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('TMDb-Key');
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },
  },
});

export const { login, logout, setRememberMe } = authSlice.actions;
export default authSlice.reducer;