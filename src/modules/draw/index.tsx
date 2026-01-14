import { Route, Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/moduleIndex.module.css';
import DrawListPage from './list/DrawListPage';
import CellDrawingIndex from './cell';

// 임시 플레이스홀더 컴포넌트
const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: '20px' }}>
    <h2>{title}</h2>
    <p>준비 중입니다.</p>
  </div>
);

export default function DrawIndex() {
  const { sub } = MENU_CONFIG.draw;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes>
          <Route path='factory' element={<DrawListPage />} />
          <Route path='cell/*' element={<CellDrawingIndex />} />
          <Route path='list' element={<PlaceholderPage title='도면 관리 대장' />} />
        </Routes>
      </div>
    </div>
  );
}
