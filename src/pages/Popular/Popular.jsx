import { useState, useEffect, useRef, useCallback } from 'react';
import { getPopularMovies } from '../../api/tmdb';
import MovieCard from '../../components/MovieCard/MovieCard';
import Loading from '../../components/Loading/Loading';
import Toast from '../../components/Toast/Toast';
import useWishlist from '../../hooks/useWishlist';
import './Popular.css';

const Popular = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('infinite'); // 'table' or 'infinite'
  const [toast, setToast] = useState(null);
  
  const observerRef = useRef();
  const loadMoreRef = useRef();
  
  const { toggleWishlist, isInWishlist } = useWishlist();

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
      setToast({ message: '영화 데이터를 불러오는데 실패했습니다.', type: 'error' });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

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
    const added = toggleWishlist(movie);
    setToast({
      message: added ? `"${movie.title}"을(를) 찜 목록에 추가했습니다.` : `"${movie.title}"을(를) 찜 목록에서 제거했습니다.`,
      type: added ? 'success' : 'info'
    });
  };

  if (loading && movies.length === 0) {
    return (
      <div className="page">
        <Loading />
      </div>
    );
  }

  return (
    <div className="popular-page page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🔥 대세 콘텐츠</h1>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('table')}
            >
              테이블 뷰
            </button>
            <button
              className={`toggle-btn ${viewMode === 'infinite' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('infinite')}
            >
              무한 스크롤
            </button>
          </div>
        </div>

        <div className={`movies-grid ${viewMode}`}>
          {movies.map((movie) => (
            <MovieCard
              key={`${movie.id}-${page}`}
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
              ◀ 이전
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
              다음 ▶
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
              ▲ TOP
            </button>
          </>
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

export default Popular;