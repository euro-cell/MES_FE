const API_BASE = import.meta.env.VITE_API_BASE_URL;

import React from 'react';
import axios from '../api/axiosInstance';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../modules/etc/user/userRoleMap';
import { MENU_CONFIG } from '../modules/menuConfig';
import styles from '../styles/layout/topbar.module.css';

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, expiresIn } = useAuth();

  const formatExpiry = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const timeStr =
      h > 0 ? `${h}시간 ${m}분 ${String(s).padStart(2, '0')}초` : `${m}분 ${String(s).padStart(2, '0')}초`;
    return `로그인 유지 시간: ${timeStr}`;
  };

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

  // ✅ MENU_CONFIG에서 경로와 제목 자동 매칭
  const allMenus = Object.values(MENU_CONFIG);
  const currentMenu = allMenus.find(menu => location.pathname.startsWith(menu.path)) || null;

  // ✅ 기본 페이지명
  const pageTitle = currentMenu?.title || '유로셀 MES';

  return (
    <div className={styles.topBar}>
      <h2>{pageTitle}</h2>

      <div className={styles.right}>
        {formatExpiry(expiresIn) && <span className={styles.sessionTimer}>{formatExpiry(expiresIn)}</span>}
        {user ? (
          <>
            <span className={styles.userInfo}>
              {user.name} ({displayRole})
            </span>
            <button className={styles.profileBtn} onClick={() => navigate('/profile')}>
              내 정보
            </button>
          </>
        ) : (
          <span className={styles.userInfo}>로그인 사용자</span>
        )}

        <button className={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Topbar;
