import { Route, Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/moduleIndex.module.css';
import PlantProductionPage from './production/PlantProductionPage';

// 임시 플레이스홀더 컴포넌트
const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: '20px' }}>
    <h2>{title}</h2>
    <p>준비 중입니다.</p>
  </div>
);

export default function PlantIndex() {
  const { sub } = MENU_CONFIG.plant;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes>
          <Route path='production/*' element={<PlantProductionPage />} />
          <Route path='development' element={<PlaceholderPage title='개발' />} />
          <Route path='measurement' element={<PlaceholderPage title='측정' />} />
          <Route path='register' element={<PlaceholderPage title='설비 등록' />} />
        </Routes>
      </div>
    </div>
  );
}
