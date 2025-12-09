import { useState, useEffect } from 'react';

const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  // 초기 로드
  useEffect(() => {
    const saved = localStorage.getItem('movieWishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  // 위시리스트 저장
  const saveWishlist = (newWishlist) => {
    localStorage.setItem('movieWishlist', JSON.stringify(newWishlist));
    setWishlist(newWishlist);
  };

  // 위시리스트 토글 (추가/제거)
  const toggleWishlist = (movie) => {
    const exists = wishlist.find(item => item.id === movie.id);
    
    if (exists) {
      const newWishlist = wishlist.filter(item => item.id !== movie.id);
      saveWishlist(newWishlist);
      return false; // 제거됨
    } else {
      const movieData = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        overview: movie.overview,
        release_date: movie.release_date,
      };
      const newWishlist = [...wishlist, movieData];
      saveWishlist(newWishlist);
      return true; // 추가됨
    }
  };

  // 위시리스트에 있는지 확인
  const isInWishlist = (movieId) => {
    return wishlist.some(item => item.id === movieId);
  };

  return { wishlist, toggleWishlist, isInWishlist };
};

export default useWishlist;