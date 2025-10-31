import { useNavigate } from 'react-router-dom';
import '../../styles/moduleIndex.css';

export default function DrawIndex() {
  const navigate = useNavigate();

  const subMenus = [{ title: '도면 관리 대장', path: '/draw/list' }];

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
