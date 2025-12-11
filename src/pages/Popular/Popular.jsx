import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPopularMovies } from '../../api/tmdb';
import { toggleWishlist } from '../../store/wishlistSlice';
import { showToast } from '../../store/toastSlice';
import MovieCard from '../../components/MovieCard/MovieCard';
import Loading from '../../components/Loading/Loading';
import './Popular.css';

const Popular = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('infinite');
  const [visibleCount, setVisibleCount] = useState(20);
  
  const observerRef = useRef();
  const loadMoreRef = useRef();
  const gridRef = useRef();
  
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);
  const { language } = useSelector((state) => state.settings);

  const isInWishlist = (movieId) => {
    return wishlist.some(item => item.id === movieId);
  };

  // 화면 크기에 따라 보여줄 영화 개수 계산
  const calculateVisibleCount = useCallback(() => {
    if (viewMode !== 'table') return 20;
    
    const isMobile = window.innerWidth <= 768;
    
    // 모바일
    if (isMobile) {
      const headerHeight = 60;
      const pageHeaderHeight = 120;
      const paginationHeight = 70;
      const padding = 40;
      
      const availableHeight = window.innerHeight - headerHeight - pageHeaderHeight - paginationHeight - padding;
      const availableWidth = window.innerWidth - 32;
      
      const cardMinWidth = 100;
      const cardHeight = 200;
      const gap = 8;
      
      const columns = Math.max(Math.floor((availableWidth + gap) / (cardMinWidth + gap)), 2);
      const rows = Math.max(Math.floor((availableHeight + gap) / (cardHeight + gap)), 2);
      
      return Math.min(columns * rows, 20);
    }
    
    // 데스크탑
    const headerHeight = 70;
    const pageHeaderHeight = 100;
    const paginationHeight = 80;
    const padding = 60;
    
    const availableHeight = window.innerHeight - headerHeight - pageHeaderHeight - paginationHeight - padding;
    const availableWidth = window.innerWidth * 0.92 - 32;
    
    const cardMinWidth = 150;
    const cardHeight = 300;
    const gap = 12;
    
    const columns = Math.max(Math.floor((availableWidth + gap) / (cardMinWidth + gap)), 2);
    const rows = Math.max(Math.floor((availableHeight + gap) / (cardHeight + gap)), 1);
    
    const count = columns * rows;
    return Math.min(Math.max(count, 4), 20);
  }, [viewMode]);

  // 화면 크기 변경 감지 (debounce 적용)
  useEffect(() => {
    let resizeTimer;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (viewMode === 'table') {
          setVisibleCount(calculateVisibleCount());
        }
      }, 150);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [viewMode, calculateVisibleCount]);

  // 영화 데이터 불러오기
  const fetchMovies = useCallback(async (pageNum, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const response = await getPopularMovies(pageNum);
      const newMovies = response.data.results;
      
      if (append) {
        setMovies(prev => [...prev, ...newMovies]);
      } else {
        setMovies(newMovies);
      }
      
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('영화 데이터를 불러오는데 실패했습니다:', error);
      dispatch(showToast({ message: language === 'ko' ? '영화 데이터를 불러오는데 실패했습니다.' : 'Failed to load movies.', type: 'error' }));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dispatch, language]);

  // 초기 로드
  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  // 무한 스크롤 Observer
  useEffect(() => {
    if (viewMode !== 'infinite' || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && page < totalPages) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [viewMode, loading, loadingMore, page, totalPages]);

  // 페이지 변경 시 추가 로드 (무한 스크롤)
  useEffect(() => {
    if (page > 1 && viewMode === 'infinite') {
      fetchMovies(page, true);
    }
  }, [page, viewMode, fetchMovies]);

  // 뷰 모드 변경
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setPage(1);
    setMovies([]);
    fetchMovies(1);
    
    if (mode === 'table') {
      setTimeout(() => {
        setVisibleCount(calculateVisibleCount());
      }, 100);
    }
  };

  // 테이블 뷰 페이지 변경
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchMovies(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // 테이블 뷰에서 보여줄 영화 목록
  const displayedMovies = viewMode === 'table' 
    ? movies.slice(0, visibleCount) 
    : movies;

  if (loading && movies.length === 0) {
    return (
      <div className="page">
        <Loading />
      </div>
    );
  }

  return (
    <div className={`popular-page page ${viewMode === 'table' ? 'table-view' : 'infinite-view'}`}>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <i className="fas fa-fire"></i> {language === 'ko' ? '대세 콘텐츠' : 'Popular'}
          </h1>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('table')}
            >
              <i className="fas fa-table"></i> {language === 'ko' ? '테이블 뷰' : 'Table View'}
            </button>
            <button
              className={`toggle-btn ${viewMode === 'infinite' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('infinite')}
            >
              <i className="fas fa-infinity"></i> {language === 'ko' ? '무한 스크롤' : 'Infinite Scroll'}
            </button>
          </div>
        </div>

        <div className={`movies-grid ${viewMode}`}>
          {displayedMovies.map((movie, index) => (
            <MovieCard
              key={`${movie.id}-${index}`}
              movie={movie}
              isWishlisted={isInWishlist(movie.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>

        {/* 테이블 뷰 페이지네이션 */}
        {viewMode === 'table' && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <i className="fas fa-chevron-left"></i> {language === 'ko' ? '이전' : 'Prev'}
            </button>
            <div className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`page-num ${page === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              className="page-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              {language === 'ko' ? '다음' : 'Next'} <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}

        {/* 무한 스크롤 로딩 */}
        {viewMode === 'infinite' && (
          <>
            <div ref={loadMoreRef} className="load-more-trigger">
              {loadingMore && <Loading />}
            </div>
            <button className="scroll-top-btn" onClick={scrollToTop}>
              <i className="fas fa-arrow-up"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Popular;