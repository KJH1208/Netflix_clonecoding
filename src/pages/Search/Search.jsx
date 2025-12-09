import { useState, useEffect } from 'react';
import { searchMovies, getGenres, getMoviesByGenre, getPopularMovies } from '../../api/tmdb';
import MovieCard from '../../components/MovieCard/MovieCard';
import Loading from '../../components/Loading/Loading';
import Toast from '../../components/Toast/Toast';
import useWishlist from '../../hooks/useWishlist';
import './Search.css';

const Search = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [minRating, setMinRating] = useState(0);
  const [toast, setToast] = useState(null);
  
  const { toggleWishlist, isInWishlist } = useWishlist();

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
  const handleSearch = async () => {
    try {
      setLoading(true);
      let results = [];

      if (searchQuery.trim()) {
        // 검색어가 있으면 검색 API 사용
        const response = await searchMovies(searchQuery);
        results = response.data.results;
      } else if (selectedGenre) {
        // 장르 필터가 있으면 장르별 영화
        const response = await getMoviesByGenre(selectedGenre);
        results = response.data.results;
      } else {
        // 둘 다 없으면 인기 영화
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
      setToast({ message: '검색에 실패했습니다.', type: 'error' });
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

  // 필터 초기화
  const handleReset = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSortBy('popularity');
    setMinRating(0);
  };

  const handleToggleWishlist = (movie) => {
    const added = toggleWishlist(movie);
    setToast({
      message: added ? `"${movie.title}"을(를) 찜 목록에 추가했습니다.` : `"${movie.title}"을(를) 찜 목록에서 제거했습니다.`,
      type: added ? 'success' : 'info'
    });
  };

  return (
    <div className="search-page page">
      <div className="container">
        <h1 className="page-title">🔍 찾아보기</h1>

        {/* 검색 & 필터 영역 */}
        <div className="search-filters">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="영화 제목을 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">검색</button>
          </form>

          <div className="filters">
            <div className="filter-group">
              <label>장르</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="filter-select"
              >
                <option value="">전체 장르</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>정렬</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="popularity">인기순</option>
                <option value="rating">평점순</option>
                <option value="release_date">최신순</option>
                <option value="title">제목순</option>
              </select>
            </div>

            <div className="filter-group">
              <label>최소 평점: {minRating}점</label>
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
              초기화
            </button>
          </div>
        </div>

        {/* 검색 결과 */}
        {loading ? (
          <Loading />
        ) : movies.length > 0 ? (
          <>
            <p className="results-count">총 {movies.length}개의 결과</p>
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
            <p>검색 결과가 없습니다.</p>
            <p>다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Search;