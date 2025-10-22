const API_BASE = import.meta.env.VITE_API_BASE_URL;

import React from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // ✅ 로그인 상태/유저 정보 가져오기
import { ROLE_LABELS } from '../modules/users/userRoleMap';

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ✅ 로그아웃 처리
  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
      navigate('/login', { replace: true });
      window.location.reload(); // 세션 초기화 후 새로고침
    } catch (err) {
      console.error('로그아웃 실패:', err);
    }
  };

  const displayRole = user?.role ? ROLE_LABELS[user.role] || user.role : '';

  const pathTitleMap: Record<string, string> = {
    '/dashboard': '대시보드',
    '/users': '인원관리',
    '/production': '생산관리',
    '/process': '공정관리',
    '/material': '자재관리',
    '/quality': '품질관리',
    '/status': '설비현황',
    '/permission': '메뉴접근관리',
  };

  const currentPath = Object.keys(pathTitleMap).find(key => location.pathname.startsWith(key));
  const pageTitle = currentPath ? pathTitleMap[currentPath] : '유로셀 MES';

  return (
    <div className='top-bar'>
      <h2>{pageTitle}</h2>

      <div className='right'>
        {/* ✅ 로그인 사용자 정보 표시 */}
        {user ? (
          <span className='user-info'>
            {user.name} ({displayRole})
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
