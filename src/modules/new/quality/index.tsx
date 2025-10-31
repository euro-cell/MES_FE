import { useNavigate } from 'react-router-dom';
import '../../styles/moduleIndex.css';

export default function QualityIndex() {
  const navigate = useNavigate();

  const subMenus = [
    { title: 'IQC', path: '/quality-new/iqc' },
    { title: 'LQC', path: '/quality-new/lqc' },
    { title: 'OQC', path: '/quality-new/oqc' },
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
