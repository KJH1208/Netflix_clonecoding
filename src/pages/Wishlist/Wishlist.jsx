import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlist } from '../../store/wishlistSlice';
import { showToast } from '../../store/toastSlice';
import MovieCard from '../../components/MovieCard/MovieCard';
import './Wishlist.css';

const Wishlist = () => {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);
  const { language } = useSelector((state) => state.settings);

  const isInWishlist = (movieId) => {
    return wishlist.some(item => item.id === movieId);
  };

  const handleToggleWishlist = (movie) => {
    dispatch(toggleWishlist(movie));
    dispatch(showToast({
      message: `"${movie.title}"${language === 'ko' ? '을(를) 찜 목록에서 제거했습니다.' : ' removed from My List.'}`,
      type: 'info'
    }));
  };

  return (
    <div className="wishlist-page page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-heart"></i> {language === 'ko' ? '내가 찜한 리스트' : 'My List'}
          </h1>
          <span className="wishlist-count">
            <i className="fas fa-film"></i> {wishlist.length}{language === 'ko' ? '개의 영화' : ' movies'}
          </span>
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
            <div className="empty-icon">
              <i className="fas fa-heart-broken"></i>
            </div>
            <h2>{language === 'ko' ? '찜한 영화가 없습니다' : 'Your list is empty'}</h2>
            <p>{language === 'ko' ? '마음에 드는 영화를 찾아 찜 목록에 추가해보세요!' : 'Find movies you like and add them to your list!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;