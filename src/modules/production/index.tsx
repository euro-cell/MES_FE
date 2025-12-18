import { Routes, Route } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import '../../styles/moduleIndex.css';

import PlanPage from './plan';
import SpecPage from './spec';
import WorklogPage from './worklog';
import StatusIndex from './status';
import LotIndex from './lot';

export default function ProductionIndex() {
  const { sub } = MENU_CONFIG.production;

  return (
    <div className='module-page'>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes>
          <Route path='plan/*' element={<PlanPage />} />
          <Route path='spec/*' element={<SpecPage />} />
          <Route path='log/*' element={<WorklogPage />} />
          <Route path='status/*' element={<StatusIndex />} />
          <Route path='lot/*' element={<LotIndex />} />
        </Routes>
      </div>
    </div>
  );
}
