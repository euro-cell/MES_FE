import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/components/moduleIndex.module.css';

const PlanPage = lazy(() => import('./plan'));
const SpecPage = lazy(() => import('./spec'));
const WorklogPage = lazy(() => import('./worklog'));
const StatusIndex = lazy(() => import('./status'));
const LotIndex = lazy(() => import('./lot'));
const SearchIndex = lazy(() => import('./lot/search'));

export default function ProductionIndex() {
  const { sub } = MENU_CONFIG.project;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Suspense fallback={<div>로딩 중...</div>}>
          <Routes>
            <Route path='plan/*' element={<PlanPage />} />
            <Route path='spec/*' element={<SpecPage />} />
            <Route path='log/*' element={<WorklogPage />} />
            <Route path='status/*' element={<StatusIndex />} />
            <Route path='lot/*' element={<LotIndex />} />
            <Route path='search/*' element={<SearchIndex />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}
