import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchMovies, getGenres, getMoviesByGenre, getPopularMovies } from '../../api/tmdb';
import { toggleWishlist } from '../../store/wishlistSlice';
import { showToast } from '../../store/toastSlice';
import { addRecentSearch, removeRecentSearch, clearRecentSearches } from '../../store/settingsSlice';
import MovieCard from '../../components/MovieCard/MovieCard';
import Loading from '../../components/Loading/Loading';
import './Search.css';

const Search = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [minRating, setMinRating] = useState(0);
  
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);
  const { recentSearches, language } = useSelector((state) => state.settings);

  const isInWishlist = (movieId) => {
    return wishlist.some(item => item.id === movieId);
  };

  // 장르 목록 불러오기
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await getGenres();
        setGenres(response.data.genres);
      } catch (error) {
        console.error('장르 데이터를 불러오는데 실패했습니다:', error);
      }
    };
    fetchGenres();
  }, []);

  // 초기 인기 영화 로드
  useEffect(() => {
    const fetchInitialMovies = async () => {
      try {
        setLoading(true);
        const response = await getPopularMovies();
        setMovies(response.data.results);
      } catch (error) {
        console.error('영화 데이터를 불러오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialMovies();
  }, []);

  // 검색 실행
  const handleSearch = async (query = searchQuery) => {
    try {
      setLoading(true);
      let results = [];

      if (query.trim()) {
        const response = await searchMovies(query);
        results = response.data.results;
        
        // 최근 검색어에 추가
        dispatch(addRecentSearch(query));
      } else if (selectedGenre) {
        const response = await getMoviesByGenre(selectedGenre);
        results = response.data.results;
      } else {
        const response = await getPopularMovies();
        results = response.data.results;
      }

      // 평점 필터 적용
      if (minRating > 0) {
        results = results.filter(movie => movie.vote_average >= minRating);
      }

      // 정렬 적용
      results = sortMovies(results, sortBy);

      setMovies(results);
    } catch (error) {
      console.error('검색에 실패했습니다:', error);
      dispatch(showToast({ message: language === 'ko' ? '검색에 실패했습니다.' : 'Search failed.', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // 정렬 함수
  const sortMovies = (movieList, sortType) => {
    const sorted = [...movieList];
    switch (sortType) {
      case 'popularity':
        return sorted.sort((a, b) => b.popularity - a.popularity);
      case 'rating':
        return sorted.sort((a, b) => b.vote_average - a.vote_average);
      case 'release_date':
        return sorted.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
      default:
        return sorted;
    }
  };

  // 필터 변경 시 자동 검색
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [selectedGenre, sortBy, minRating]);

  // 검색어 입력 후 Enter 또는 버튼 클릭
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // 최근 검색어 클릭
  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  // 필터 초기화
  const handleReset = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSortBy('popularity');
    setMinRating(0);
  };

  const handleToggleWishlist = (movie) => {
    const isCurrentlyInWishlist = isInWishlist(movie.id);
    dispatch(toggleWishlist(movie));
    dispatch(showToast({
      message: isCurrentlyInWishlist 
        ? `"${movie.title}"${language === 'ko' ? '을(를) 찜 목록에서 제거했습니다.' : ' removed from My List.'}`
        : `"${movie.title}"${language === 'ko' ? '을(를) 찜 목록에 추가했습니다.' : ' added to My List.'}`,
      type: isCurrentlyInWishlist ? 'info' : 'success'
    }));
  };

  return (
    <div className="search-page page">
      <div className="container">
        <h1 className="page-title">🔍 {language === 'ko' ? '찾아보기' : 'Search'}</h1>

        {/* 검색 & 필터 영역 */}
        <div className="search-filters">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder={language === 'ko' ? '영화 제목을 검색하세요...' : 'Search for movies...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              {language === 'ko' ? '검색' : 'Search'}
            </button>
          </form>

          {/* 최근 검색어 */}
          {recentSearches.length > 0 && (
            <div className="recent-searches">
              <div className="recent-searches-header">
                <span className="recent-searches-label">
                  {language === 'ko' ? '최근 검색어' : 'Recent Searches'}
                </span>
                <button 
                  className="clear-searches-btn"
                  onClick={() => dispatch(clearRecentSearches())}
                >
                  {language === 'ko' ? '전체 삭제' : 'Clear All'}
                </button>
              </div>
              <div className="recent-searches-list">
                {recentSearches.map((query, index) => (
                  <div key={index} className="recent-search-item">
                    <button 
                      className="recent-search-btn"
                      onClick={() => handleRecentSearchClick(query)}
                    >
                      {query}
                    </button>
                    <button 
                      className="remove-search-btn"
                      onClick={() => dispatch(removeRecentSearch(query))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="filters">
            <div className="filter-group">
              <label>{language === 'ko' ? '장르' : 'Genre'}</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="filter-select"
              >
                <option value="">{language === 'ko' ? '전체 장르' : 'All Genres'}</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>{language === 'ko' ? '정렬' : 'Sort'}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="popularity">{language === 'ko' ? '인기순' : 'Popularity'}</option>
                <option value="rating">{language === 'ko' ? '평점순' : 'Rating'}</option>
                <option value="release_date">{language === 'ko' ? '최신순' : 'Release Date'}</option>
                <option value="title">{language === 'ko' ? '제목순' : 'Title'}</option>
              </select>
            </div>

            <div className="filter-group">
              <label>{language === 'ko' ? '최소 평점' : 'Min Rating'}: {minRating}{language === 'ko' ? '점' : ''}</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="filter-range"
              />
            </div>

            <button className="reset-btn" onClick={handleReset}>
              {language === 'ko' ? '초기화' : 'Reset'}
            </button>
          </div>
        </div>

        {/* 검색 결과 */}
        {loading ? (
          <Loading />
        ) : movies.length > 0 ? (
          <>
            <p className="results-count">
              {language === 'ko' ? `총 ${movies.length}개의 결과` : `${movies.length} results`}
            </p>
            <div className="movies-grid">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isWishlisted={isInWishlist(movie.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="no-results">
            <p>{language === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}</p>
            <p>{language === 'ko' ? '다른 검색어나 필터를 시도해보세요.' : 'Try different keywords or filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;