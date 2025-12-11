import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutFirebase } from '../../firebase';
import { clearUser } from '../../store/authSlice';
import { showToast } from '../../store/toastSlice';
import { setTheme, setLanguage, setAnimationEnabled } from '../../store/settingsSlice';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { userEmail, loginMethod } = useSelector((state) => state.auth);
  const { theme, language, animationEnabled } = useSelector((state) => state.settings);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSettingsOpen(false);
  }, [location]);

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
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('TMDb-Key');
    
    if (loginMethod === 'google') {
      await logoutFirebase();
    }
    
    dispatch(clearUser());
    dispatch(showToast({ message: language === 'ko' ? '로그아웃 되었습니다.' : 'Logged out.', type: 'info' }));
    navigate('/signin');
  };

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));
    dispatch(showToast({ 
      message: newTheme === 'dark' 
        ? (language === 'ko' ? '다크 모드로 변경되었습니다.' : 'Dark mode enabled.')
        : (language === 'ko' ? '라이트 모드로 변경되었습니다.' : 'Light mode enabled.'), 
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

  const handleAnimationToggle = () => {
    const newValue = !animationEnabled;
    dispatch(setAnimationEnabled(newValue));
    dispatch(showToast({ 
      message: newValue 
        ? (language === 'ko' ? '애니메이션이 활성화되었습니다.' : 'Animations enabled.')
        : (language === 'ko' ? '애니메이션이 비활성화되었습니다.' : 'Animations disabled.'), 
      type: 'success' 
    }));
  };

  const isActive = (path) => location.pathname === path;

  const getLoginBadge = () => {
    if (loginMethod === 'google') {
      return (
        <span className="login-badge google">
          <i className="fab fa-google"></i>
        </span>
      );
    } else if (loginMethod === 'tmdb') {
      return (
        <span className="login-badge tmdb">
          <i className="fas fa-key"></i>
        </span>
      );
    }
    return null;
  };

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

                <div className="settings-section">
                  <span className="settings-label">
                    <i className="fas fa-magic"></i> {language === 'ko' ? '애니메이션' : 'Animation'}
                  </span>
                  <div className="settings-options">
                    <button 
                      className={`settings-option ${animationEnabled ? 'active' : ''}`}
                      onClick={handleAnimationToggle}
                    >
                      <i className={`fas fa-${animationEnabled ? 'play' : 'pause'}`}></i> 
                      {animationEnabled 
                        ? (language === 'ko' ? '켜짐' : 'On') 
                        : (language === 'ko' ? '꺼짐' : 'Off')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="user-info">
            {getLoginBadge()}
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