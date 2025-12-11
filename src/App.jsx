import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { onAuthChange } from './firebase';
import { setUser, clearUser, setLoading } from './store/authSlice';
import { setGenres, setAnimationEnabled } from './store/settingsSlice';
import { getGenres } from './api/tmdb';
import Header from './components/Header/Header';
import SignIn from './pages/SignIn/SignIn';
import Home from './pages/Home/Home';
import Popular from './pages/Popular/Popular';
import Search from './pages/Search/Search';
import Wishlist from './pages/Wishlist/Wishlist';
import ToastContainer from './components/Toast/ToastContainer';
import Loading from './components/Loading/Loading';
import './styles/global.css';
import './styles/transitions.css';

// 인증된 사용자만 접근 가능한 라우트
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useSelector((state) => state.auth);
  
  if (isLoading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loading />
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }
  
  return (
    <>
      <Header />
      {children}
    </>
  );
};

// 이미 로그인된 사용자는 홈으로 리다이렉트
const PublicRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useSelector((state) => state.auth);
  
  if (isLoading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loading />
      </div>
    );
  }
  
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// 페이지 전환 애니메이션 래퍼
const PageWrapper = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="page-transition" key={location.pathname}>
      {children}
    </div>
  );
};

// 라우트 컴포넌트
const AppRoutes = () => {
  return (
    <PageWrapper>
      <Routes>
        <Route 
          path="/signin" 
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/popular" 
          element={
            <ProtectedRoute>
              <Popular />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wishlist" 
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageWrapper>
  );
};

function App() {
  const dispatch = useDispatch();
  const { theme, animationEnabled } = useSelector((state) => state.settings);

  // 테마 초기화
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 애니메이션 설정 초기화
  useEffect(() => {
    if (!animationEnabled) {
      document.documentElement.classList.add('animations-paused');
    } else {
      document.documentElement.classList.remove('animations-paused');
    }
  }, [animationEnabled]);

  // 장르 목록 로드 (API 캐싱)
  useEffect(() => {
    const loadGenres = async () => {
      const cachedGenres = localStorage.getItem('genres');
      
      // 이미 캐시된 장르가 있으면 API 호출 안 함
      if (cachedGenres && JSON.parse(cachedGenres).length > 0) {
        dispatch(setGenres(JSON.parse(cachedGenres)));
        return;
      }
      
      try {
        const response = await getGenres();
        dispatch(setGenres(response.data.genres));
      } catch (error) {
        console.error('장르 목록 로드 실패:', error);
      }
    };
    
    loadGenres();
  }, [dispatch]);

  useEffect(() => {
    // Local Storage에서 TMDB 로그인 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (isLoggedIn === 'true' && currentUser) {
      dispatch(setUser({
        email: currentUser,
        uid: currentUser,
        loginMethod: 'tmdb'
      }));
    }
    
    // Firebase 인증 상태 감시 (구글 로그인)
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        dispatch(setUser({
          email: user.email,
          uid: user.uid,
          loginMethod: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
        }));
      } else {
        const tmdbLoggedIn = localStorage.getItem('isLoggedIn');
        const tmdbUser = localStorage.getItem('currentUser');
        
        if (tmdbLoggedIn !== 'true' || !tmdbUser) {
          dispatch(clearUser());
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router basename="/Netflix_clonecoding">
      <AppRoutes />
      <ToastContainer />
    </Router>
  );
}

export default App;