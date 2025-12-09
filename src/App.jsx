import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Header from './components/Header/Header';
import SignIn from './pages/SignIn/SignIn';
import Home from './pages/Home/Home';
import Popular from './pages/Popular/Popular';
import Search from './pages/Search/Search';
import Wishlist from './pages/Wishlist/Wishlist';
import './styles/global.css';

// 인증된 사용자만 접근 가능한 라우트
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
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
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
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
    </Router>
  );
}

export default App;