import { useState } from 'react';
import { useSelector } from 'react-redux';
import './MovieCard.css';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const MovieCard = ({ movie, isWishlisted, onToggleWishlist }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const genres = useSelector((state) => state.settings.genres);

  // 영화의 장르 이름 가져오기 (최대 2개)
  const getGenreNames = () => {
    if (!movie.genre_ids || !genres.length) return [];
    return movie.genre_ids
      .slice(0, 2)
      .map(id => genres.find(g => g.id === id)?.name)
      .filter(Boolean);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleClick = () => {
    if (onToggleWishlist) {
      onToggleWishlist(movie);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const genreNames = getGenreNames();

  return (
    <div 
      className={`movie-card ${isWishlisted ? 'wishlisted' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${movie.title} ${isWishlisted ? '찜 해제' : '찜하기'}`}
    >
      <div className="movie-card-image">
        {/* 스켈레톤 로딩 */}
        {!imageLoaded && (
          <div className="movie-card-skeleton skeleton"></div>
        )}
        
        {/* 이미지 */}
        {movie.poster_path && !imageError ? (
          <img
            src={`${IMAGE_BASE_URL}${movie.poster_path}`}
            alt={movie.title}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        ) : (
          <div className="movie-card-no-image">
            <i className="fas fa-film"></i>
            <p>No Image</p>
          </div>
        )}

        {/* 찜 아이콘 */}
        {isWishlisted && (
          <span className="wishlist-badge">
            <i className="fas fa-check"></i> 찜
          </span>
        )}

        {/* 오버레이 */}
        <div className="movie-card-overlay">
          <span className="wishlist-icon" aria-hidden="true">
            <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart`}></i>
          </span>
          <p className="movie-overview">
            {movie.overview 
              ? movie.overview.slice(0, 100) + (movie.overview.length > 100 ? '...' : '')
              : '줄거리 정보가 없습니다.'
            }
          </p>
        </div>
      </div>

      <div className="movie-card-info">
        <h3 className="movie-title">{movie.title}</h3>
        
        {/* 장르 태그 */}
        {genreNames.length > 0 && (
          <div className="movie-genres">
            {genreNames.map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>
        )}
        
        <div className="movie-meta">
          <span className="movie-rating" aria-label={`평점 ${movie.vote_average?.toFixed(1)}`}>
            <i className="fas fa-star"></i> {movie.vote_average?.toFixed(1)}
          </span>
          <span className="movie-year">
            <i className="far fa-calendar"></i> {movie.release_date?.split('-')[0] || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;