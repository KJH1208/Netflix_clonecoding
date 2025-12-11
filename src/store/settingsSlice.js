import { createSlice } from '@reduxjs/toolkit';

// 초기 상태를 localStorage에서 불러오기
const loadSettingsFromStorage = () => {
  const theme = localStorage.getItem('theme') || 'dark';
  const language = localStorage.getItem('language') || 'ko';
  const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  const genres = JSON.parse(localStorage.getItem('genres') || '[]');
  const animationEnabled = localStorage.getItem('animationEnabled') !== 'false';
  
  return { theme, language, recentSearches, genres, animationEnabled };
};

const initialState = loadSettingsFromStorage();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    addRecentSearch: (state, action) => {
      const query = action.payload.trim();
      if (!query) return;
      
      state.recentSearches = state.recentSearches.filter(item => item !== query);
      state.recentSearches.unshift(query);
      
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
    setGenres: (state, action) => {
      state.genres = action.payload;
      localStorage.setItem('genres', JSON.stringify(action.payload));
    },
    setAnimationEnabled: (state, action) => {
      state.animationEnabled = action.payload;
      localStorage.setItem('animationEnabled', action.payload.toString());
      
      if (action.payload) {
        document.documentElement.classList.remove('animations-paused');
      } else {
        document.documentElement.classList.add('animations-paused');
      }
    },
  },
});

export const { 
  setTheme, 
  setLanguage, 
  addRecentSearch, 
  removeRecentSearch, 
  clearRecentSearches,
  setGenres,
  setAnimationEnabled
} = settingsSlice.actions;

export default settingsSlice.reducer;