import { Routes, Route } from 'react-router-dom';
import { MENU_CONFIG } from '../../menuConfig';
import SubmenuBar from '../../../components/SubmenuBar';
import '../../../styles/moduleIndex.css';

import PlanPage from './plan';
// import SpecPage from './spec';
// import LogPage from './log';
// import StatusPage from './status';
// import LotPage from './lot';

export default function ProductionIndex() {
  const { sub } = MENU_CONFIG.production;

  return (
    <div className='module-page'>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes>
          <Route path='plan' element={<PlanPage />} />
          {/* <Route path="spec" element={<SpecPage />} />
          <Route path="log" element={<LogPage />} />
          <Route path="status" element={<StatusPage />} />
          <Route path="lot" element={<LotPage />} /> */}
        </Routes>
      </div>
    </div>
  );
}
