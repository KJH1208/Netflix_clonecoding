import { useState } from 'react';
import './MovieCard.css';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const MovieCard = ({ movie, isWishlisted, onToggleWishlist }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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
            <span>🎬</span>
            <p>No Image</p>
          </div>
        )}

        {/* 찜 아이콘 */}
        {isWishlisted && (
          <span className="wishlist-badge" aria-hidden="true">찜</span>
        )}

        {/* 오버레이 */}
        <div className="movie-card-overlay">
          <span className="wishlist-icon" aria-hidden="true">
            {isWishlisted ? '❤️' : '🤍'}
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
        <div className="movie-meta">
          <span className="movie-rating" aria-label={`평점 ${movie.vote_average?.toFixed(1)}`}>
            ⭐ {movie.vote_average?.toFixed(1)}
          </span>
          <span className="movie-year">
            {movie.release_date?.split('-')[0] || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;