import { createSlice } from '@reduxjs/toolkit';

// 초기 상태를 localStorage에서 불러오기
const loadSettingsFromStorage = () => {
  const theme = localStorage.getItem('theme') || 'dark';
  const language = localStorage.getItem('language') || 'ko';
  const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  
  return { theme, language, recentSearches };
};

const initialState = loadSettingsFromStorage();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      
      // HTML에 테마 클래스 적용
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    addRecentSearch: (state, action) => {
      const query = action.payload.trim();
      if (!query) return;
      
      // 중복 제거
      state.recentSearches = state.recentSearches.filter(item => item !== query);
      
      // 맨 앞에 추가
      state.recentSearches.unshift(query);
      
      // 최대 5개만 유지
      if (state.recentSearches.length > 5) {
        state.recentSearches = state.recentSearches.slice(0, 5);
      }
      
      localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
    },
    removeRecentSearch: (state, action) => {
      state.recentSearches = state.recentSearches.filter(item => item !== action.payload);
      localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
      localStorage.removeItem('recentSearches');
    },
  },
});

export const { 
  setTheme, 
  setLanguage, 
  addRecentSearch, 
  removeRecentSearch, 
  clearRecentSearches 
} = settingsSlice.actions;

export default settingsSlice.reducer;