import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Firebase 인증 상태 감시
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        dispatch(setUser({
          email: user.email,
          uid: user.uid,
          loginMethod: user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'
        }));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router>
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
      
      {/* 전역 토스트 */}
      <ToastContainer />
    </Router>
  );
}

export default App;