import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBHWwksU8dysC5J_-0Tq0nDa1zSHQGFbhQ",
  authDomain: "netflix-clonecodig.firebaseapp.com",
  projectId: "netflix-clonecodig",
  storageBucket: "netflix-clonecodig.firebasestorage.app",
  messagingSenderId: "464270618650",
  appId: "1:464270618650:web:3c745cdec8f4ac661d21a3",
  measurementId: "G-9MY8VBTJ9F"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 구글 로그인
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 이메일/비밀번호 회원가입
export const registerWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    let message = '회원가입에 실패했습니다.';
    if (error.code === 'auth/email-already-in-use') {
      message = '이미 사용 중인 이메일입니다.';
    } else if (error.code === 'auth/weak-password') {
      message = '비밀번호는 6자 이상이어야 합니다.';
    } else if (error.code === 'auth/invalid-email') {
      message = '올바른 이메일 형식이 아닙니다.';
    }
    return { success: false, error: message };
  }
};

// 이메일/비밀번호 로그인
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    let message = '로그인에 실패했습니다.';
    if (error.code === 'auth/user-not-found') {
      message = '존재하지 않는 계정입니다.';
    } else if (error.code === 'auth/wrong-password') {
      message = '비밀번호가 올바르지 않습니다.';
    } else if (error.code === 'auth/invalid-email') {
      message = '올바른 이메일 형식이 아닙니다.';
    } else if (error.code === 'auth/invalid-credential') {
      message = '이메일 또는 비밀번호가 올바르지 않습니다.';
    }
    return { success: false, error: message };
  }
};

// 로그아웃
export const logoutFirebase = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// 인증 상태 감시
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };