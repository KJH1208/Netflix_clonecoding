import { createSlice } from '@reduxjs/toolkit';

// Local Storage에서 초기 상태 불러오기
const loadInitialState = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const currentUser = localStorage.getItem('currentUser');
  const savedEmail = localStorage.getItem('savedEmail');
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  
  return {
    isLoggedIn: isLoggedIn && !!currentUser,
    isLoading: true,
    userEmail: currentUser || '',
    userId: currentUser || '',
    loginMethod: localStorage.getItem('loginMethod') || '',
    savedEmail: savedEmail || '',
    rememberMe: rememberMe
  };
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isLoggedIn = true;
      state.isLoading = false;
      state.userEmail = action.payload.email;
      state.userId = action.payload.uid;
      state.loginMethod = action.payload.loginMethod || 'email';
      
      // Local Storage에도 저장
      localStorage.setItem('loginMethod', action.payload.loginMethod || 'email');
    },
    clearUser: (state) => {
      state.isLoggedIn = false;
      state.isLoading = false;
      state.userEmail = '';
      state.userId = '';
      state.loginMethod = '';
      
      // Local Storage에서 로그인 정보 삭제
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('TMDb-Key');
      localStorage.removeItem('loginMethod');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setRememberMe: (state, action) => {
      const { rememberMe, email } = action.payload;
      state.rememberMe = rememberMe;
      state.savedEmail = rememberMe ? email : '';
      
      // Local Storage에 저장
      localStorage.setItem('rememberMe', rememberMe.toString());
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
      } else {
        localStorage.removeItem('savedEmail');
      }
    }
  }
});

export const { setUser, clearUser, setLoading, setRememberMe } = authSlice.actions;
export default authSlice.reducer;