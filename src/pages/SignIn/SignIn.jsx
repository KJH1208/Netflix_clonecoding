import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '../../store/authSlice';
import { showToast } from '../../store/toastSlice';
import './SignIn.css';

// 회원가입 함수
const tryRegister = (email, password) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userExists = users.some(user => user.id === email);
  
  if (userExists) {
    return { success: false, message: '이미 존재하는 이메일입니다.' };
  }
  
  users.push({ id: email, password: password });
  localStorage.setItem('users', JSON.stringify(users));
  return { success: true, message: '회원가입 성공!' };
};

// 로그인 검증 함수
const validateLogin = (email, password) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(user => user.id === email && user.password === password);
  
  if (user) {
    localStorage.setItem('TMDb-Key', user.password);
    return { success: true, message: '로그인 성공!' };
  }
  return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
};

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

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    const result = validateLogin(loginEmail, loginPassword);
    
    if (result.success) {
      dispatch(login({ email: loginEmail, rememberMe }));
      dispatch(showToast({ message: result.message, type: 'success' }));
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      dispatch(showToast({ message: result.message, type: 'error' }));
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    const result = tryRegister(registerEmail, registerPassword);
    
    if (result.success) {
      dispatch(showToast({ message: result.message, type: 'success' }));
      setTimeout(() => {
        setIsLoginMode(true);
        setLoginEmail(registerEmail);
        setRegisterEmail('');
        setRegisterPassword('');
        setConfirmPassword('');
        setAgreeTerms(false);
      }, 1000);
    } else {
      dispatch(showToast({ message: result.message, type: 'error' }));
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
                />
                {errors.loginPassword && <span className="error-text">{errors.loginPassword}</span>}
              </div>
              
              <button type="submit" className="submit-btn">로그인</button>
              
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
                />
                {errors.registerEmail && <span className="error-text">{errors.registerEmail}</span>}
              </div>
              
              <div className="form-group">
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className={errors.registerPassword ? 'error' : ''}
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
              
              <button type="submit" className="submit-btn">회원가입</button>
              
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