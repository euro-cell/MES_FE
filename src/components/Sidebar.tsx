import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        {/* 메인 화면 */}
        <li onClick={() => navigate('/dashboard')}>대시보드</li>

        {/* 프로젝트(생산계획) */}
        <li onClick={() => navigate('/projects')}>생산계획</li>

        {/* 미구현 메뉴 */}
        <li onClick={() => handlePending('자재관리')}>자재관리</li>
        <li onClick={() => handlePending('공정관리')}>공정관리</li>
        <li onClick={() => handlePending('품질관리')}>품질관리</li>
        <li onClick={() => handlePending('공정현황')}>공정현황</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
