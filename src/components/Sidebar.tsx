import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/sidebar.module.css';
import { MENU_CONFIG } from '../modules/menuConfig';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const NEW_MENUS = Object.values(MENU_CONFIG);

  const getActiveMenuPath = () => {
    for (const menu of NEW_MENUS) {
      if (location.pathname.startsWith(menu.path)) {
        return menu.path;
      }
    }
    return '';
  };

  const activeMenuPath = getActiveMenuPath();

  return (
    <aside className={styles.sidebar}>
      <h1>유로셀 MES</h1>

      <ul>
        {NEW_MENUS.map(menu => (
          <li
            key={menu.title}
            className={`${styles.menuTitle} ${activeMenuPath === menu.path ? styles.activeTop : ''}`}
            onClick={() => navigate(menu.path)}
          >
            {menu.title}
          </li>
        ))}

        <hr />

        {/* ✅ 기존 메뉴 (임시 유지) */}
        <li onClick={() => navigate('/material')}>자재관리</li>
        <li></li>
        <li onClick={() => navigate('/status')}>공정현황</li>
        <li></li>
        <li onClick={() => navigate('/users')}>인원관리</li>
        <li onClick={() => navigate('/permission')}>메뉴접근관리</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
