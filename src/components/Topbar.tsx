const API_BASE = import.meta.env.VITE_API_BASE_URL;

import React from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../modules/old/users/userRoleMap';
import { MENU_CONFIG } from '../modules/menuConfig';
import styles from '../styles/topbar.module.css';

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

  // ✅ MENU_CONFIG에서 경로와 제목 자동 매칭
  const allMenus = Object.values(MENU_CONFIG);
  const currentMenu = allMenus.find(menu => location.pathname.startsWith(menu.path)) || null;

  // ✅ 기본 페이지명
  const pageTitle =
    currentMenu?.title ||
    (() => {
      // 기존 modules용 라우트도 표시 가능하게 보완
      if (location.pathname.startsWith('/dashboard')) return '대시보드';
      if (location.pathname.startsWith('/users')) return '인원관리';
      if (location.pathname.startsWith('/production')) return '생산관리';
      if (location.pathname.startsWith('/specification')) return '전지설계';
      if (location.pathname.startsWith('/material')) return '자재관리';
      if (location.pathname.startsWith('/status')) return '공정현황';
      if (location.pathname.startsWith('/permission')) return '메뉴접근관리';
      return '유로셀 MES';
    })();

  return (
    <div className={styles.topBar}>
      <h2>{pageTitle}</h2>

      <div className={styles.right}>
        {user ? (
          <span className={styles.userInfo}>
            {user.name} ({displayRole})
          </span>
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
