import { useNavigate } from 'react-router-dom';
import '../../../styles/moduleIndex.css';
import { MENU_CONFIG } from '../../menuConfig';

export default function PlantIndex() {
  const navigate = useNavigate();
  const { title, sub } = MENU_CONFIG.plant;

  return (
    <div className='module-page'>
      <h2>{title}</h2>
      <div className='submenu-bar'>
        {sub.map(menu => (
          <button key={menu.path} onClick={() => navigate(menu.path)} className='submenu-button'>
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
