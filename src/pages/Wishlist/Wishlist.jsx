import { useState } from 'react';
import MovieCard from '../../components/MovieCard/MovieCard';
import Toast from '../../components/Toast/Toast';
import useWishlist from '../../hooks/useWishlist';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const [toast, setToast] = useState(null);

  const handleToggleWishlist = (movie) => {
    const added = toggleWishlist(movie);
    setToast({
      message: added ? `"${movie.title}"을(를) 찜 목록에 추가했습니다.` : `"${movie.title}"을(를) 찜 목록에서 제거했습니다.`,
      type: added ? 'success' : 'info'
    });
  };

  return (
    <div className="wishlist-page page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">❤️ 내가 찜한 리스트</h1>
          <span className="wishlist-count">{wishlist.length}개의 영화</span>
        </div>

        {wishlist.length > 0 ? (
          <div className="movies-grid">
            {wishlist.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isWishlisted={isInWishlist(movie.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="empty-wishlist">
            <div className="empty-icon">🎬</div>
            <h2>찜한 영화가 없습니다</h2>
            <p>마음에 드는 영화를 찾아 찜 목록에 추가해보세요!</p>
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

export default Wishlist;