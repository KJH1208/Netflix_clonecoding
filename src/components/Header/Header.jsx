import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutFirebase } from '../../firebase';
import { showToast } from '../../store/toastSlice';
import { setTheme, setLanguage } from '../../store/settingsSlice';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux에서 상태 가져오기
  const { userEmail, loginMethod } = useSelector((state) => state.auth);
  const { theme, language } = useSelector((state) => state.settings);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSettingsOpen(false);
  }, [location]);

  // 외부 클릭 시 설정 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.settings-container')) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const result = await logoutFirebase();
    if (result.success) {
      dispatch(showToast({ message: '로그아웃 되었습니다.', type: 'info' }));
      navigate('/signin');
    }
  };

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
    dispatch(showToast({ 
      message: newTheme === 'dark' ? '다크 모드로 변경되었습니다.' : '라이트 모드로 변경되었습니다.', 
      type: 'success' 
    }));
  };

  const handleLanguageChange = (newLanguage) => {
    dispatch(setLanguage(newLanguage));
    dispatch(showToast({ 
      message: newLanguage === 'ko' ? '한국어로 변경되었습니다.' : 'Changed to English.', 
      type: 'success' 
    }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <i className="fas fa-film"></i> NEATFLIX
          </Link>
          
          <nav className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <i className="fas fa-home"></i>
              <span>{language === 'ko' ? '홈' : 'Home'}</span>
            </Link>
            <Link to="/popular" className={`nav-link ${isActive('/popular') ? 'active' : ''}`}>
              <i className="fas fa-fire"></i>
              <span>{language === 'ko' ? '대세 콘텐츠' : 'Popular'}</span>
            </Link>
            <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>
              <i className="fas fa-search"></i>
              <span>{language === 'ko' ? '찾아보기' : 'Search'}</span>
            </Link>
            <Link to="/wishlist" className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}>
              <i className="fas fa-heart"></i>
              <span>{language === 'ko' ? '내가 찜한 리스트' : 'My List'}</span>
            </Link>
          </nav>
        </div>

        <div className="header-right">
          {/* 설정 버튼 */}
          <div className="settings-container">
            <button 
              className="settings-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(!isSettingsOpen);
              }}
              aria-label="설정"
            >
              <i className="fas fa-cog"></i>
            </button>
            
            {isSettingsOpen && (
              <div className="settings-dropdown">
                <div className="settings-section">
                  <span className="settings-label">
                    <i className="fas fa-palette"></i> {language === 'ko' ? '테마' : 'Theme'}
                  </span>
                  <div className="settings-options">
                    <button 
                      className={`settings-option ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <i className="fas fa-moon"></i> {language === 'ko' ? '다크' : 'Dark'}
                    </button>
                    <button 
                      className={`settings-option ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <i className="fas fa-sun"></i> {language === 'ko' ? '라이트' : 'Light'}
                    </button>
                  </div>
                </div>
                
                <div className="settings-section">
                  <span className="settings-label">
                    <i className="fas fa-globe"></i> {language === 'ko' ? '언어' : 'Language'}
                  </span>
                  <div className="settings-options">
                    <button 
                      className={`settings-option ${language === 'ko' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('ko')}
                    >
                      한국어
                    </button>
                    <button 
                      className={`settings-option ${language === 'en' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('en')}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="user-info">
            {loginMethod === 'google' && (
              <span className="login-badge">
                <i className="fab fa-google"></i>
              </span>
            )}
            <span className="user-email">
              <i className="fas fa-user"></i> {userEmail}
            </span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>{language === 'ko' ? '로그아웃' : 'Logout'}</span>
          </button>
        </div>

        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="메뉴"
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