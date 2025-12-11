import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/authSlice';
import { showToast } from '../../store/toastSlice';
import { signInWithGoogle } from '../../firebase';
import { verifyApiKey } from '../../api/tmdb';
import './SignIn.css';

// 이메일 검증 함수
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Local Storage 유틸리티 함수
const getStoredUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

const saveUserToStorage = (email, password) => {
  const users = getStoredUsers();
  const existingUser = users.find(user => user.email === email);
  
  if (existingUser) {
    return { success: false, message: '이미 등록된 이메일입니다.' };
  }
  
  users.push({ email, password });
  localStorage.setItem('users', JSON.stringify(users));
  return { success: true };
};

const getUserFromStorage = (email) => {
  const users = getStoredUsers();
  return users.find(user => user.email === email);
};

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isLoggedIn } = useSelector((state) => state.auth);
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 로그인 폼
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // 회원가입 폼
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // 에러
  const [errors, setErrors] = useState({});

  // 이미 로그인된 경우 홈으로 이동
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  // 저장된 이메일 불러오기 (Remember Me)
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRememberMe) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // 로그인 ↔ 회원가입 전환 효과
  const switchMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLoginMode(!isLoginMode);
      setErrors({});
      setIsAnimating(false);
    }, 300);
  };

  // 로그인 폼 검증
  const validateLoginForm = () => {
    const newErrors = {};
    
    if (!loginEmail) {
      newErrors.loginEmail = '이메일을 입력해주세요.';
    } else if (!validateEmail(loginEmail)) {
      newErrors.loginEmail = '올바른 이메일 형식이 아닙니다.';
    }
    
    if (!loginPassword) {
      newErrors.loginPassword = '비밀번호를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 회원가입 폼 검증
  const validateRegisterForm = () => {
    const newErrors = {};
    
    if (!registerEmail) {
      newErrors.registerEmail = '이메일을 입력해주세요.';
    } else if (!validateEmail(registerEmail)) {
      newErrors.registerEmail = '올바른 이메일 형식이 아닙니다.';
    }
    
    if (!registerPassword) {
      newErrors.registerPassword = '비밀번호를 입력해주세요.';
    } else if (registerPassword.length < 4) {
      newErrors.registerPassword = '비밀번호는 4자 이상이어야 합니다.';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (registerPassword !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    if (!agreeTerms) {
      newErrors.agreeTerms = '약관에 동의해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setIsSubmitting(true);
    
    // 1. Local Storage에서 사용자 확인
    const user = getUserFromStorage(loginEmail);
    
    if (!user) {
      setIsSubmitting(false);
      dispatch(showToast({ message: '등록되지 않은 이메일입니다.', type: 'error' }));
      return;
    }
    
    if (user.password !== loginPassword) {
      setIsSubmitting(false);
      dispatch(showToast({ message: '비밀번호가 일치하지 않습니다.', type: 'error' }));
      return;
    }
    
    // 2. TMDB API 키로 검증 시도
    const apiResult = await verifyApiKey(loginPassword);
    
    // Remember Me 저장
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('savedEmail', loginEmail);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('savedEmail');
    }
    
    // 로그인 상태 저장
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', loginEmail);
    
    // API 키가 유효하면 저장, 아니면 빈 값
    if (apiResult.success) {
      localStorage.setItem('TMDb-Key', loginPassword);
      dispatch(showToast({ message: '로그인 성공! API 키가 확인되었습니다.', type: 'success' }));
    } else {
      localStorage.setItem('TMDb-Key', '');
      dispatch(showToast({ message: '로그인 성공! (API 키가 유효하지 않아 영화 정보가 표시되지 않을 수 있습니다)', type: 'warning' }));
    }
    
    // Redux 상태 업데이트
    dispatch(setUser({
      email: loginEmail,
      uid: loginEmail,
      loginMethod: 'tmdb'
    }));
    
    setIsSubmitting(false);
    navigate('/');
  };

  // 회원가입 처리 (API 키 검증 없이 일반 비밀번호도 허용)
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setIsSubmitting(true);
    
    // Local Storage에 사용자 저장 (API 키 검증 없이)
    const result = saveUserToStorage(registerEmail, registerPassword);
    
    setIsSubmitting(false);
    
    if (result.success) {
      // API 키인지 확인해서 안내 메시지 다르게
      const apiResult = await verifyApiKey(registerPassword);
      
      if (apiResult.success) {
        dispatch(showToast({ message: '회원가입 성공! TMDB API 키로 등록되었습니다.', type: 'success' }));
      } else {
        dispatch(showToast({ message: '회원가입 성공! (일반 비밀번호로 등록됨 - 영화 정보 표시 안 될 수 있음)', type: 'success' }));
      }
      
      // 로그인 폼으로 전환하고 이메일 자동 입력
      setLoginEmail(registerEmail);
      setRegisterEmail('');
      setRegisterPassword('');
      setConfirmPassword('');
      setAgreeTerms(false);
      
      // 로그인 모드로 전환 (애니메이션)
      setIsAnimating(true);
      setTimeout(() => {
        setIsLoginMode(true);
        setIsAnimating(false);
      }, 300);
    } else {
      dispatch(showToast({ message: result.message, type: 'error' }));
    }
  };

  // 구글 로그인 (Firebase)
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const result = await signInWithGoogle();
    setIsSubmitting(false);
    
    if (result.success) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', result.user.email);
      localStorage.setItem('TMDb-Key', ''); // 구글 로그인은 API 키 없음
      
      dispatch(setUser({
        email: result.user.email,
        uid: result.user.uid,
        loginMethod: 'google'
      }));
      
      dispatch(showToast({ message: '구글 로그인 성공! (영화 정보를 보려면 TMDB API 키로 로그인하세요)', type: 'success' }));
      navigate('/');
    } else {
      dispatch(showToast({ message: result.error, type: 'error' }));
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-background">
        <div className="signin-overlay"></div>
      </div>
      
      <div className="signin-header">
        <h1 className="signin-logo">
          <i className="fas fa-film"></i> NEATFLIX
        </h1>
      </div>

      <div className="signin-container">
        <div className={`form-wrapper ${isAnimating ? 'animating' : ''}`}>
          {isLoginMode ? (
            <form className="signin-form" onSubmit={handleLogin}>
              <h2><i className="fas fa-sign-in-alt"></i> 로그인</h2>
              
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> 이메일</label>
                <input
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={errors.loginEmail ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.loginEmail && <span className="error-text">{errors.loginEmail}</span>}
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-key"></i> 비밀번호</label>
                <input
                  type="password"
                  placeholder="비밀번호 또는 TMDB API 키"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={errors.loginPassword ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.loginPassword && <span className="error-text">{errors.loginPassword}</span>}
              </div>
              
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span><i className="fas fa-save"></i> 로그인 정보 저장</span>
                </label>
              </div>
              
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><i className="fas fa-spinner fa-spin"></i> 로그인 중...</>
                ) : (
                  <><i className="fas fa-sign-in-alt"></i> 로그인</>
                )}
              </button>

              <div className="divider">
                <span>또는</span>
              </div>

              <button 
                type="button" 
                className="social-btn google-btn"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
              >
                <i className="fab fa-google"></i> Google로 계속하기
              </button>
              
              <p className="switch-text">
                계정이 없으신가요?{' '}
                <button type="button" className="switch-btn" onClick={switchMode}>
                  <i className="fas fa-user-plus"></i> 회원가입
                </button>
              </p>
              
              <div className="api-info">
                <p><i className="fas fa-info-circle"></i> TMDB API 키를 비밀번호로 사용하면 영화 정보를 볼 수 있습니다.</p>
                <p><i className="fas fa-lightbulb"></i> 일반 비밀번호로도 로그인 가능합니다.</p>
              </div>
            </form>
          ) : (
            <form className="signin-form" onSubmit={handleRegister}>
              <h2><i className="fas fa-user-plus"></i> 회원가입</h2>
              
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> 이메일</label>
                <input
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className={errors.registerEmail ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.registerEmail && <span className="error-text">{errors.registerEmail}</span>}
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-key"></i> 비밀번호</label>
                <input
                  type="password"
                  placeholder="비밀번호 또는 TMDB API 키"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className={errors.registerPassword ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.registerPassword && <span className="error-text">{errors.registerPassword}</span>}
              </div>
              
              <div className="form-group">
                <label><i className="fas fa-check-double"></i> 비밀번호 확인</label>
                <input
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              
              <div className="form-options">
                <label className={`checkbox-label ${errors.agreeTerms ? 'error' : ''}`}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span><i className="fas fa-file-contract"></i> 이용약관 및 개인정보 처리방침에 동의합니다.</span>
                </label>
              </div>
              {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}
              
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><i className="fas fa-spinner fa-spin"></i> 가입 중...</>
                ) : (
                  <><i className="fas fa-user-plus"></i> 회원가입</>
                )}
              </button>

              <div className="divider">
                <span>또는</span>
              </div>

              <button 
                type="button" 
                className="social-btn google-btn"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
              >
                <i className="fab fa-google"></i> Google로 계속하기
              </button>
              
              <p className="switch-text">
                이미 계정이 있으신가요?{' '}
                <button type="button" className="switch-btn" onClick={switchMode}>
                  <i className="fas fa-sign-in-alt"></i> 로그인
                </button>
              </p>
              
              <div className="api-info">
                <p><i className="fas fa-info-circle"></i> TMDB API 키를 비밀번호로 사용하면 영화 정보를 볼 수 있습니다.</p>
                <p><i className="fas fa-lightbulb"></i> 일반 비밀번호로도 가입 가능합니다.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;