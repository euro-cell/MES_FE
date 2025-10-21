import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // ✅ 로그인 상태/유저 정보 가져오기

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ 로그아웃 처리
  const handleLogout = async () => {
    try {
      await axios.post('http://192.168.0.22:8080/auth/logout', {}, { withCredentials: true });
      navigate('/login', { replace: true });
      window.location.reload(); // 세션 초기화 후 새로고침
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  return (
    <div className='top-bar'>
      <h2>대시보드</h2>

      <div className='right'>
        {/* ✅ 로그인 사용자 정보 표시 */}
        {user ? (
          <span className='user-info'>
            {user.name} ({user.role})
          </span>
        ) : (
          <span className='user-info'>로그인 사용자</span>
        )}

        <button className='logout-btn' onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Topbar;
