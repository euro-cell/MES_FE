import { useNavigate } from 'react-router-dom';
import '../../styles/moduleIndex.css';

export default function StockIndex() {
  const navigate = useNavigate();

  const subMenus = [
    { title: '원자재 관리', path: '/stock/material' },
    { title: '셀 관리', path: '/stock/cell' },
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
