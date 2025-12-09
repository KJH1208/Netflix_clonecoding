import { createSlice } from '@reduxjs/toolkit';

// 초기 상태를 localStorage에서 불러오기
const loadWishlistFromStorage = () => {
  const saved = localStorage.getItem('movieWishlist');
  return saved ? JSON.parse(saved) : [];
};

const initialState = {
  items: loadWishlistFromStorage(),
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const movie = action.payload;
      const exists = state.items.find(item => item.id === movie.id);
      
      if (!exists) {
        const movieData = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          overview: movie.overview,
          release_date: movie.release_date,
        };
        state.items.push(movieData);
        localStorage.setItem('movieWishlist', JSON.stringify(state.items));
      }
    },
    removeFromWishlist: (state, action) => {
      const movieId = action.payload;
      state.items = state.items.filter(item => item.id !== movieId);
      localStorage.setItem('movieWishlist', JSON.stringify(state.items));
    },
    toggleWishlist: (state, action) => {
      const movie = action.payload;
      const existingIndex = state.items.findIndex(item => item.id === movie.id);
      
      if (existingIndex >= 0) {
        // 제거
        state.items.splice(existingIndex, 1);
      } else {
        // 추가
        const movieData = {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          overview: movie.overview,
          release_date: movie.release_date,
        };
        state.items.push(movieData);
      }
      localStorage.setItem('movieWishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('movieWishlist');
    },
  },
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, clearWishlist } = wishlistSlice.actions;

// Selectors
export const selectWishlist = (state) => state.wishlist.items;
export const selectIsInWishlist = (movieId) => (state) => 
  state.wishlist.items.some(item => item.id === movieId);

export default wishlistSlice.reducer;