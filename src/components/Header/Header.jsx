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
            NEATFLIX
          </Link>
          
          <nav className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              {language === 'ko' ? '홈' : 'Home'}
            </Link>
            <Link to="/popular" className={`nav-link ${isActive('/popular') ? 'active' : ''}`}>
              {language === 'ko' ? '대세 콘텐츠' : 'Popular'}
            </Link>
            <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>
              {language === 'ko' ? '찾아보기' : 'Search'}
            </Link>
            <Link to="/wishlist" className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}>
              {language === 'ko' ? '내가 찜한 리스트' : 'My List'}
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
            >
              ⚙️
            </button>
            
            {isSettingsOpen && (
              <div className="settings-dropdown">
                <div className="settings-section">
                  <span className="settings-label">{language === 'ko' ? '테마' : 'Theme'}</span>
                  <div className="settings-options">
                    <button 
                      className={`settings-option ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      🌙 {language === 'ko' ? '다크' : 'Dark'}
                    </button>
                    <button 
                      className={`settings-option ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      ☀️ {language === 'ko' ? '라이트' : 'Light'}
                    </button>
                  </div>
                </div>
                
                <div className="settings-section">
                  <span className="settings-label">{language === 'ko' ? '언어' : 'Language'}</span>
                  <div className="settings-options">
                    <button 
                      className={`settings-option ${language === 'ko' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('ko')}
                    >
                      🇰🇷 한국어
                    </button>
                    <button 
                      className={`settings-option ${language === 'en' ? 'active' : ''}`}
                      onClick={() => handleLanguageChange('en')}
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="user-info">
            {loginMethod === 'google' && <span className="login-badge">G</span>}
            <span className="user-email">{userEmail}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            {language === 'ko' ? '로그아웃' : 'Logout'}
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