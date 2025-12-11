import axios from 'axios';

const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// 로그인 시 저장된 API 키 가져오기
const getApiKey = () => {
  return localStorage.getItem('TMDb-Key') || '';
};

// 동적으로 API 키를 사용하는 axios 인스턴스 생성
const createTmdbApi = () => {
  return axios.create({
    baseURL: BASE_URL,
    params: {
      api_key: getApiKey(),
      language: 'ko-KR',
    },
  });
};

// 인기 영화
export const getPopularMovies = (page = 1) => {
  return createTmdbApi().get('/movie/popular', { params: { page } });
};

// 현재 상영작
export const getNowPlayingMovies = (page = 1) => {
  return createTmdbApi().get('/movie/now_playing', { params: { page } });
};

// 평점 높은 영화
export const getTopRatedMovies = (page = 1) => {
  return createTmdbApi().get('/movie/top_rated', { params: { page } });
};

// 개봉 예정작
export const getUpcomingMovies = (page = 1) => {
  return createTmdbApi().get('/movie/upcoming', { params: { page } });
};

// 영화 검색
export const searchMovies = (query, page = 1) => {
  return createTmdbApi().get('/search/movie', { params: { query, page } });
};

// 장르 목록
export const getGenres = () => {
  return createTmdbApi().get('/genre/movie/list');
};

// 장르별 영화
export const getMoviesByGenre = (genreId, page = 1) => {
  return createTmdbApi().get('/discover/movie', { 
    params: { with_genres: genreId, page } 
  });
};

// 영화 상세 정보
export const getMovieDetails = (movieId) => {
  return createTmdbApi().get(`/movie/${movieId}`);
};

// API 키 검증 (로그인 시 사용)
export const verifyApiKey = async (apiKey) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/popular`, {
      params: {
        api_key: apiKey,
        language: 'ko-KR',
        page: 1
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.status === 401 
        ? '유효하지 않은 API 키입니다.' 
        : 'API 호출에 실패했습니다.' 
    };
  }
};

export default createTmdbApi;