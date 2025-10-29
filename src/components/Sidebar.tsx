import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  // 아직 준비되지 않은 메뉴용 함수
  const handlePending = (name: string) => {
    alert(`${name} 페이지는 준비 중입니다.`);
  };

  return (
    <aside className='sidebar'>
      <h1>유로셀 MES</h1>
      <ul>
        <li onClick={() => navigate('/dashboard')}>대시보드</li>
        <li onClick={() => navigate('/production')}>생산계획</li>
        <li onClick={() => navigate('/specification')}>전지설계</li>
        <li onClick={() => navigate('/users')}>인원관리</li>
        <li onClick={() => navigate('/permission')}>메뉴접근관리</li>

        {/*                     미구현 메뉴                     */}
        <li>-- 🔽 미완성 🔽 --</li>
        <li onClick={() => handlePending('자재관리')}>자재관리</li>
        <li onClick={() => handlePending('공정관리')}>공정관리</li>
        <li onClick={() => handlePending('품질관리')}>품질관리</li>
        <li onClick={() => handlePending('공정현황')}>공정현황</li>
        {/*                     미구현 메뉴                     */}
      </ul>
    </aside>
  );
};

export default Sidebar;
