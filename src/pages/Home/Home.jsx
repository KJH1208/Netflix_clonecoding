import { useState, useEffect } from 'react';
import { getPopularMovies, getNowPlayingMovies, getTopRatedMovies, getUpcomingMovies, IMAGE_BASE_URL } from '../../api/tmdb';
import MovieCard from '../../components/MovieCard/MovieCard';
import Loading from '../../components/Loading/Loading';
import Toast from '../../components/Toast/Toast';
import useWishlist from '../../hooks/useWishlist';
import './Home.css';

const Home = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [popular, nowPlaying, topRated, upcoming] = await Promise.all([
          getPopularMovies(),
          getNowPlayingMovies(),
          getTopRatedMovies(),
          getUpcomingMovies()
        ]);
        
        setPopularMovies(popular.data.results);
        setNowPlayingMovies(nowPlaying.data.results);
        setTopRatedMovies(topRated.data.results);
        setUpcomingMovies(upcoming.data.results);
        
        // 랜덤 추천 영화 설정
        const randomIndex = Math.floor(Math.random() * popular.data.results.length);
        setFeaturedMovie(popular.data.results[randomIndex]);
      } catch (error) {
        console.error('영화 데이터를 불러오는데 실패했습니다:', error);
        setToast({ message: '영화 데이터를 불러오는데 실패했습니다.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleToggleWishlist = (movie) => {
    const added = toggleWishlist(movie);
    setToast({
      message: added ? `"${movie.title}"을(를) 찜 목록에 추가했습니다.` : `"${movie.title}"을(를) 찜 목록에서 제거했습니다.`,
      type: added ? 'success' : 'info'
    });
  };

  if (loading) {
    return (
      <div className="page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* 히어로 배너 */}
      {featuredMovie && (
        <section className="hero-banner">
          <div 
            className="hero-background"
            style={{
              backgroundImage: `url(${IMAGE_BASE_URL}/original${featuredMovie.backdrop_path})`
            }}
          >
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">{featuredMovie.title}</h1>
            <p className="hero-overview">
              {featuredMovie.overview?.slice(0, 200)}
              {featuredMovie.overview?.length > 200 && '...'}
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary hero-btn">
                ▶ 재생
              </button>
              <button 
                className="btn btn-secondary hero-btn"
                onClick={() => handleToggleWishlist(featuredMovie)}
              >
                {isInWishlist(featuredMovie.id) ? '✓ 찜 해제' : '+ 내가 찜한 리스트'}
              </button>
            </div>
            <div className="hero-meta">
              <span className="hero-rating">⭐ {featuredMovie.vote_average?.toFixed(1)}</span>
              <span className="hero-year">{featuredMovie.release_date?.split('-')[0]}</span>
            </div>
          </div>
        </section>
      )}

      {/* 영화 섹션들 */}
      <div className="movie-sections">
        <MovieSection 
          title="🔥 인기 영화" 
          movies={popularMovies}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist}
        />
        <MovieSection 
          title="🎬 현재 상영작" 
          movies={nowPlayingMovies}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist}
        />
        <MovieSection 
          title="⭐ 평점 높은 영화" 
          movies={topRatedMovies}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist}
        />
        <MovieSection 
          title="🎉 개봉 예정작" 
          movies={upcomingMovies}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist}
        />
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

// 영화 섹션 컴포넌트
const MovieSection = ({ title, movies, onToggleWishlist, isInWishlist }) => {
  return (
    <section className="movie-section">
      <h2 className="section-title">{title}</h2>
      <div className="movie-row">
        <div className="movie-row-inner">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isWishlisted={isInWishlist(movie.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;