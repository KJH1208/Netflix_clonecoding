# 🎬 NEATFLIX - Netflix Clone

React.js 기반 Netflix 클론 프로젝트입니다. TMDB API를 활용하여 실제 영화 데이터를 표시하고, Firebase를 통한 Google 로그인과 TMDB API 키 인증을 지원합니다.

## 🌐 배포 링크

**Live Demo:** [https://kjh1208.github.io/Netflix_clonecoding/](https://kjh1208.github.io/Netflix_clonecoding/)

## 📸 스크린샷

### 로그인 페이지
- 이메일/비밀번호 로그인 (TMDB API 키 또는 일반 비밀번호)
- Google OAuth 로그인
- 회원가입 기능

### 메인 홈 페이지
- 인기 영화, 현재 상영작, 평점 높은 영화, 개봉 예정작 섹션
- 영화 카드에 장르 태그 표시
- 찜하기 기능

### 대세 콘텐츠 (Popular) 페이지
- **테이블 뷰**: 스크롤 비활성화, 페이지네이션
- **무한 스크롤 뷰**: 스크롤 활성화, 자동 로딩

### 찾아보기 (Search) 페이지
- 장르별 필터링
- 평점별 필터링
- 정렬 기능 (인기순, 평점순, 최신순, 제목순)
- 최근 검색어 저장

### 찜한 리스트 (Wishlist) 페이지
- Local Storage 기반 찜 목록 관리
- 빈 상태 UI

## 🛠 기술 스택

### Frontend
- **React.js 18** - UI 라이브러리
- **Redux Toolkit** - 상태 관리
- **React Router v6** - 라우팅
- **Axios** - HTTP 클라이언트
- **CSS3** - 스타일링 (CSS Variables, Flexbox, Grid)

### Backend / Services
- **TMDB API** - 영화 데이터
- **Firebase Authentication** - Google 로그인

### DevOps
- **Vite** - 빌드 도구
- **GitHub Actions** - CI/CD
- **GitHub Pages** - 배포

## 📁 프로젝트 구조
```
Netflix_clonecoding/
├── public/
│   └── 404.html              # SPA 라우팅 처리
├── src/
│   ├── api/
│   │   └── tmdb.js           # TMDB API 함수
│   ├── components/
│   │   ├── Header/           # 헤더 (네비게이션, 설정)
│   │   ├── MovieCard/        # 영화 카드 컴포넌트
│   │   ├── MovieRow/         # 영화 가로 슬라이더
│   │   ├── Toast/            # 토스트 알림
│   │   └── Loading/          # 로딩 스피너
│   ├── hooks/
│   │   └── useWishlist.js    # 찜하기 커스텀 훅
│   ├── pages/
│   │   ├── SignIn/           # 로그인/회원가입
│   │   ├── Home/             # 메인 홈
│   │   ├── Popular/          # 대세 콘텐츠
│   │   ├── Search/           # 찾아보기
│   │   └── Wishlist/         # 찜한 리스트
│   ├── store/
│   │   ├── index.js          # Redux store 설정
│   │   ├── authSlice.js      # 인증 상태
│   │   ├── wishlistSlice.js  # 찜 목록 상태
│   │   ├── toastSlice.js     # 토스트 상태
│   │   └── settingsSlice.js  # 설정 상태 (테마, 언어)
│   ├── styles/
│   │   ├── global.css        # 전역 스타일
│   │   └── transitions.css   # 페이지 전환 애니메이션
│   ├── firebase.js           # Firebase 설정
│   ├── App.jsx               # 메인 앱 컴포넌트
│   └── main.jsx              # 엔트리 포인트
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 배포
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## ✨ 주요 기능

### 🔐 인증 시스템
- **이중 인증**: TMDB API 키 + Google OAuth
- **TMDB API 키 로그인**: API 키를 비밀번호로 사용하여 영화 데이터 접근
- **일반 비밀번호 로그인**: API 키 없이도 로그인 가능 (영화 데이터 미표시)
- **Remember Me**: 로그인 정보 저장
- **Protected Routes**: 미인증 사용자 접근 차단

### 🎥 영화 데이터
- TMDB API 연동 (인기, 현재 상영, 평점 높은, 개봉 예정)
- 영화 카드에 장르 태그 표시
- 찜하기/찜 해제 기능

### 📱 반응형 디자인
- 데스크탑, 태블릿, 모바일 최적화
- 모바일 햄버거 메뉴 (설정, 로그아웃 포함)
- 헤더 메뉴 반응형 전환 (텍스트 → 아이콘 → 햄버거)

### 🎨 테마 & 설정
- **다크/라이트 모드** 전환
- **한국어/영어** 언어 전환
- **애니메이션 ON/OFF** 설정
- 설정값 Local Storage 저장

### 📊 대세 콘텐츠 페이지
- **테이블 뷰**: 스크롤 비활성화, 페이지네이션
- **무한 스크롤 뷰**: 스크롤 활성화, Intersection Observer 활용

### 🔍 검색 & 필터링
- 장르별 필터
- 평점별 필터
- 정렬 옵션 (인기순, 평점순, 최신순, 제목순)
- 최근 검색어 저장 (Local Storage)

## 💾 Local Storage 사용

| 키 | 설명 |
|---|---|
| `isLoggedIn` | 로그인 상태 |
| `currentUser` | 현재 사용자 이메일 |
| `TMDb-Key` | TMDB API 키 |
| `users` | 등록된 사용자 목록 |
| `wishlist` | 찜한 영화 목록 |
| `theme` | 테마 설정 (dark/light) |
| `language` | 언어 설정 (ko/en) |
| `animationEnabled` | 애니메이션 설정 |
| `genres` | 장르 목록 캐시 |
| `recentSearches` | 최근 검색어 |
| `rememberMe` | 로그인 정보 저장 여부 |
| `savedEmail` | 저장된 이메일 |

## 🚀 실행 방법

### 1. 저장소 클론
```bash
git clone https://github.com/kjh1208/Netflix_clonecoding.git
cd Netflix_clonecoding
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

## 🔑 TMDB API 키 발급

1. [TMDB 웹사이트](https://www.themoviedb.org/) 회원가입
2. 설정 → API → API 키 신청
3. 발급받은 API 키를 비밀번호로 사용하여 로그인

## 📋 Git Branch 전략 (Gitflow)
```
main          ← 배포용 브랜치
  └── develop ← 개발 통합 브랜치
       └── feature/* ← 기능 개발 브랜치
```

### 브랜치 사용 예시
```bash
# 기능 개발
git checkout -b feature/기능명
git add .
git commit -m "feat: 기능 설명"
git push origin feature/기능명

# develop에 병합
git checkout develop
git merge feature/기능명
git push origin develop

# main에 병합 (배포)
git checkout main
git merge develop
git push origin main
```

## 📝 과제 요구사항 체크리스트

### 필수 구현 항목
- [x] React.js SPA 구현
- [x] Top-Down / Bottom-Up 데이터 흐름
- [x] 반복 렌더링 (map)
- [x] 조건부 렌더링
- [x] useRef 사용
- [x] Custom Hook (useWishlist)
- [x] Axios HTTP 클라이언트
- [x] Redux 상태 관리 (4개 슬라이스)
- [x] GitHub Actions 배포
- [x] GitHub Pages 호스팅
- [x] TMDB API 연동
- [x] Local Storage 활용
- [x] CSS 애니메이션

### 페이지별 요구사항
- [x] **로그인/회원가입 페이지**: 이메일 검증, API 키 인증, Remember Me, 약관 동의
- [x] **메인 홈 페이지**: 4개 이상 API 호출, 영화 정보 표시, 찜하기 기능
- [x] **대세 콘텐츠 페이지**: 테이블 뷰/무한 스크롤 전환, 페이지네이션, TOP 버튼
- [x] **찾아보기 페이지**: 장르/평점 필터, 정렬, 초기화, 최근 검색어
- [x] **찜한 리스트 페이지**: Local Storage 기반, 찜 해제 기능

### 선택 구현 항목
- [x] 영화 장르 태그 표시
- [x] 애니메이션 일시정지/재생 설정
- [x] API 응답 캐싱 (장르 목록)

## 🤖 AI 활용

본 프로젝트는 **Claude AI**를 활용하여 개발되었습니다.

## 👨‍💻 개발자

- **이름**: 강주현
- **GitHub**: [@kjh1208](https://github.com/kjh1208)
