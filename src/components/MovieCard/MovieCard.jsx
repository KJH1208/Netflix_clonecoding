import { IMAGE_BASE_URL } from '../../api/tmdb';
import './MovieCard.css';

const MovieCard = ({ movie, isWishlisted, onToggleWishlist }) => {
  const imageUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  const handleClick = () => {
    onToggleWishlist(movie);
  };

  return (
    <div className={`movie-card ${isWishlisted ? 'wishlisted' : ''}`} onClick={handleClick}>
      <div className="movie-card-image">
        <img src={imageUrl} alt={movie.title} loading="lazy" />
        <div className="movie-card-overlay">
          <div className="wishlist-icon">
            {isWishlisted ? '❤️' : '🤍'}
          </div>
          <p className="movie-overview">
            {movie.overview?.slice(0, 100) || '줄거리 정보가 없습니다.'}
            {movie.overview?.length > 100 && '...'}
          </p>
        </div>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-rating">⭐ {movie.vote_average?.toFixed(1)}</span>
          <span className="movie-year">
            {movie.release_date?.split('-')[0] || 'N/A'}
          </span>
        </div>
      </div>
      {isWishlisted && <div className="wishlist-badge">찜</div>}
    </div>
  );
};

export default MovieCard;