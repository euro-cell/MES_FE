import { useNavigate } from 'react-router-dom';
import '../../styles/moduleIndex.css';

export default function EtcIndex() {
  const navigate = useNavigate();

  const subMenus = [
    { title: '인원등록', path: '/users' },
    { title: '메뉴접근관리', path: '/permission' },
    { title: '환경관리', path: '/environment' },
    { title: '고객 코드 관리 대장', path: '/customer-code' },
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
