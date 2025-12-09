import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
export const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_URL;

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
  params: {
    language: 'ko-KR',
  },
});

// --- Interceptors: response & error handling ---
tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("TMDB API Error:", error.response.status, error.response.data);
    } else {
      console.error("TMDB API Network/Unknown Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// 인기 영화
export const getPopularMovies = (page = 1) => {
  return tmdbApi.get('/movie/popular', { params: { page } });
};

// 현재 상영작
export const getNowPlayingMovies = (page = 1) => {
  return tmdbApi.get('/movie/now_playing', { params: { page } });
};

// 평점 높은 영화
export const getTopRatedMovies = (page = 1) => {
  return tmdbApi.get('/movie/top_rated', { params: { page } });
};

// 개봉 예정작
export const getUpcomingMovies = (page = 1) => {
  return tmdbApi.get('/movie/upcoming', { params: { page } });
};

// 영화 검색
export const searchMovies = (query, page = 1) => {
  return tmdbApi.get('/search/movie', { params: { query, page } });
};

// 장르 목록
export const getGenres = () => {
  return tmdbApi.get('/genre/movie/list');
};

// 장르별 영화
export const getMoviesByGenre = (genreId, page = 1) => {
  return tmdbApi.get('/discover/movie', { 
    params: { with_genres: genreId, page } 
  });
};

// 영화 상세 정보
export const getMovieDetails = (movieId) => {
  return tmdbApi.get(`/movie/${movieId}`);
};

export default tmdbApi;