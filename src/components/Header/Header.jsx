import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux에서 상태 가져오기
  const currentUser = useSelector((state) => state.auth.currentUser);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 이동 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/signin');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            NEATFLIX
          </Link>
          
          <nav className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              홈
            </Link>
            <Link to="/popular" className={`nav-link ${isActive('/popular') ? 'active' : ''}`}>
              대세 콘텐츠
            </Link>
            <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>
              찾아보기
            </Link>
            <Link to="/wishlist" className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}>
              내가 찜한 리스트
            </Link>
          </nav>
        </div>

        <div className="header-right">
          <span className="user-email">{currentUser}</span>
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;