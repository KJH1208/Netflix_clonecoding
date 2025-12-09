import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setRememberMe } from '../../store/authSlice';
import { showToast } from '../../store/toastSlice';
import { signInWithGoogle, loginWithEmail, registerWithEmail } from '../../firebase';
import './SignIn.css';

// 이메일 검증 함수
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isLoggedIn, savedEmail, rememberMe: savedRememberMe } = useSelector((state) => state.auth);
  
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

  // 저장된 이메일 불러오기
  useEffect(() => {
    if (savedEmail && savedRememberMe) {
      setLoginEmail(savedEmail);
      setRememberMe(true);
    }
  }, [savedEmail, savedRememberMe]);

  const switchMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLoginMode(!isLoginMode);
      setErrors({});
      setIsAnimating(false);
    }, 300);
  };

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

  const validateRegisterForm = () => {
    const newErrors = {};
    
    if (!registerEmail) {
      newErrors.registerEmail = '이메일을 입력해주세요.';
    } else if (!validateEmail(registerEmail)) {
      newErrors.registerEmail = '올바른 이메일 형식이 아닙니다.';
    }
    
    if (!registerPassword) {
      newErrors.registerPassword = '비밀번호를 입력해주세요.';
    } else if (registerPassword.length < 6) {
      newErrors.registerPassword = '비밀번호는 6자 이상이어야 합니다.';
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

  // 이메일 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setIsSubmitting(true);
    const result = await loginWithEmail(loginEmail, loginPassword);
    setIsSubmitting(false);
    
    if (result.success) {
      dispatch(setRememberMe({ rememberMe, email: loginEmail }));
      dispatch(showToast({ message: '로그인 성공!', type: 'success' }));
    } else {
      dispatch(showToast({ message: result.error, type: 'error' }));
    }
  };

  // 이메일 회원가입
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setIsSubmitting(true);
    const result = await registerWithEmail(registerEmail, registerPassword);
    setIsSubmitting(false);
    
    if (result.success) {
      dispatch(showToast({ message: '회원가입 성공!', type: 'success' }));
    } else {
      dispatch(showToast({ message: result.error, type: 'error' }));
    }
  };

  // 구글 로그인
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const result = await signInWithGoogle();
    setIsSubmitting(false);
    
    if (result.success) {
      dispatch(showToast({ message: '구글 로그인 성공!', type: 'success' }));
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
        <h1 className="signin-logo">NEATFLIX</h1>
      </div>

      <div className="signin-container">
        <div className={`form-wrapper ${isAnimating ? 'animating' : ''}`}>
          {isLoginMode ? (
            <form className="signin-form" onSubmit={handleLogin}>
              <h2>로그인</h2>
              
              <div className="form-group">
                <input
                  type="email"
                  placeholder="이메일 주소"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={errors.loginEmail ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.loginEmail && <span className="error-text">{errors.loginEmail}</span>}
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={errors.loginPassword ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.loginPassword && <span className="error-text">{errors.loginPassword}</span>}
              </div>
              
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? '로그인 중...' : '로그인'}
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
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </button>
              
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>로그인 정보 저장</span>
                </label>
              </div>
              
              <p className="switch-text">
                계정이 없으신가요?{' '}
                <button type="button" className="switch-btn" onClick={switchMode}>
                  회원가입
                </button>
              </p>
            </form>
          ) : (
            <form className="signin-form" onSubmit={handleRegister}>
              <h2>회원가입</h2>
              
              <div className="form-group">
                <input
                  type="email"
                  placeholder="이메일 주소"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className={errors.registerEmail ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.registerEmail && <span className="error-text">{errors.registerEmail}</span>}
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  placeholder="비밀번호 (6자 이상)"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className={errors.registerPassword ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.registerPassword && <span className="error-text">{errors.registerPassword}</span>}
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              
              <div className="form-group">
                <label className={`checkbox-label ${errors.agreeTerms ? 'error' : ''}`}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span>이용약관 및 개인정보 처리방침에 동의합니다.</span>
                </label>
                {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}
              </div>
              
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? '가입 중...' : '회원가입'}
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
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </button>
              
              <p className="switch-text">
                이미 계정이 있으신가요?{' '}
                <button type="button" className="switch-btn" onClick={switchMode}>
                  로그인
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;