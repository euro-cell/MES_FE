import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/components/moduleIndex.module.css';

const MaterialIndex = lazy(() => import('./material'));
const CellIndex = lazy(() => import('./cell'));

export default function StockIndex() {
  const { sub } = MENU_CONFIG.stock;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Suspense fallback={<div>로딩 중...</div>}>
          <Routes>
            <Route path='material/*' element={<MaterialIndex />} />
            <Route path='cell/*' element={<CellIndex />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}
