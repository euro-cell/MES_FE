import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';
import { MENU_CONFIG } from '../modules/menuConfig'; // ✅ 중앙 메뉴 설정 import

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  // 아직 준비되지 않은 메뉴용
  const handlePending = (name: string) => {
    alert(`${name} 페이지는 준비 중입니다.`);
  };

  // ✅ 중앙에서 관리되는 메뉴 불러오기
  const NEW_MENUS = Object.values(MENU_CONFIG);

  return (
    <aside className='sidebar'>
      <h1>유로셀 MES</h1>

      <ul>
        {/* =========================
            🔹 신규 메뉴 영역
        ========================= */}
        {NEW_MENUS.map(menu => (
          <li key={menu.title} className='menu-title' onClick={() => navigate(menu.path)}>
            {menu.title}
          </li>
        ))}

        <hr style={{ margin: '15px 0', border: '0.5px solid #415a77' }} />

        {/* =========================
            🔹 기존 메뉴 영역 (원본 유지)
        ========================= */}
        <li onClick={() => navigate('/dashboard')}>대시보드</li>
        <li onClick={() => navigate('/production')}>생산계획</li>
        <li onClick={() => navigate('/specification')}>전지설계</li>
        <li onClick={() => navigate('/material')}>자재관리</li>
        <li></li>
        <li onClick={() => navigate('/status')}>공정현황</li>
        <li></li>
        <li onClick={() => navigate('/users')}>인원관리</li>
        <li onClick={() => navigate('/permission')}>메뉴접근관리</li>

        <li>-- 🔽 미완성 🔽 --</li>
        <li onClick={() => handlePending('공정관리')}>공정관리</li>
        <li onClick={() => handlePending('품질관리')}>품질관리</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
