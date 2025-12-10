import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { onAuthChange } from './firebase';
import { setUser, clearUser, setLoading } from './store/authSlice';
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
    // 페이지 전환 시 스크롤 맨 위로
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
        {/* 로그인/회원가입 */}
        <Route 
          path="/signin" 
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          } 
        />

        {/* 보호된 라우트들 */}
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

        {/* 없는 경로는 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageWrapper>
  );
};

function App() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.settings.theme);

  // 테마 초기화
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // 1. Local Storage에서 TMDB 로그인 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (isLoggedIn === 'true' && currentUser) {
      dispatch(setUser({
        email: currentUser,
        uid: currentUser,
        loginMethod: 'tmdb'
      }));
    }
    
    // 2. Firebase 인증 상태 감시 (구글 로그인)
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        dispatch(setUser({
          email: user.email,
          uid: user.uid,
          loginMethod: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
        }));
      } else {
        // Firebase에서 로그아웃되었지만 TMDB 로그인 상태 확인
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
    <Router>
      <AppRoutes />
      
      {/* 전역 토스트 */}
      <ToastContainer />
    </Router>
  );
}

export default App;