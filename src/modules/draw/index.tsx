import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/components/moduleIndex.module.css';

const DrawPage = lazy(() => import('./DrawPage'));
const DrawDetailPage = lazy(() => import('./DrawDetailPage'));

export default function DrawIndex() {
  const { sub } = MENU_CONFIG.draw;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Suspense fallback={<div>로딩 중...</div>}>
          <Routes>
            <Route index element={<Navigate to='list' replace />} />
            <Route path='list' element={<DrawPage />} />
            <Route path='detail/:id' element={<DrawDetailPage />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}
