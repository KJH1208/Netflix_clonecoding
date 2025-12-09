import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  currentUser: null,
  userEmail: null,
  loginMethod: null, // 'email', 'google'
  rememberMe: localStorage.getItem('rememberMe') === 'true',
  savedEmail: localStorage.getItem('savedEmail') || '',
  isLoading: true, // Firebase 인증 상태 확인 중
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { email, uid, loginMethod } = action.payload;
      state.isLoggedIn = true;
      state.currentUser = uid;
      state.userEmail = email;
      state.loginMethod = loginMethod;
      state.isLoading = false;
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', email);
    },
    clearUser: (state) => {
      state.isLoggedIn = false;
      state.currentUser = null;
      state.userEmail = null;
      state.loginMethod = null;
      state.isLoading = false;
      
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('TMDb-Key');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setRememberMe: (state, action) => {
      const { rememberMe, email } = action.payload;
      state.rememberMe = rememberMe;
      
      if (rememberMe && email) {
        state.savedEmail = email;
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', email);
      } else {
        state.savedEmail = '';
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedEmail');
      }
    },
  },
});

export const { setUser, clearUser, setLoading, setRememberMe } = authSlice.actions;
export default authSlice.reducer;