import { useNavigate } from 'react-router-dom';
import '../../styles/moduleIndex.css';

export default function ProductionIndex() {
  const navigate = useNavigate();

  const subMenus = [
    { title: '생산계획', path: '/prod/plan' },
    { title: '설계 및 자재 소요량', path: '/prod/spec' },
    { title: '작업 일지', path: '/prod/log' },
    { title: '생산 현황 (수율)', path: '/prod/status' },
    { title: 'Lot 관리', path: '/prod/lot' },
  ];

  return (
    <div className='module-page'>
      <div className='submenu-bar'>
        {subMenus.map(menu => (
          <button key={menu.title} onClick={() => navigate(menu.path)}>
            {menu.title}
          </button>
        ))}
      </div>
      <div className='module-content'>
        <p>아직 선택된 메뉴가 없습니다.</p>
      </div>
    </div>
  );
}
