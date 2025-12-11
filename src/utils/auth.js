// 회원가입
export const tryRegister = (email, password) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // 이미 존재하는 사용자인지 확인
  const userExists = users.some(user => user.id === email);
  
  if (userExists) {
    return { success: false, message: '이미 존재하는 이메일입니다.' };
  }
  
  // 새 사용자 추가
  users.push({ id: email, password: password });
  localStorage.setItem('users', JSON.stringify(users));
  
  return { success: true, message: '회원가입 성공!' };
};

// 로그인
export const tryLogin = (email, password, rememberMe = false) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  const user = users.find(user => user.id === email && user.password === password);
  
  if (user) {
    // API 키 저장 (비밀번호를 API 키로 사용)
    localStorage.setItem('TMDb-Key', user.password);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', email);
    
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('savedEmail', email);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('savedEmail');
    }
    
    return { success: true, message: '로그인 성공!' };
  }
  
  return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
};

// 로그아웃
export const logout = () => {
  localStorage.removeItem('TMDb-Key');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
};

// 로그인 상태 확인
export const isAuthenticated = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

// 현재 사용자 가져오기
export const getCurrentUser = () => {
  return localStorage.getItem('currentUser');
};

// 이메일 형식 검증
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};