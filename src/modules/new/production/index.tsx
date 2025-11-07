import { Routes, Route } from 'react-router-dom';
import { MENU_CONFIG } from '../../menuConfig';
import SubmenuBar from '../../../components/SubmenuBar';
import '../../../styles/moduleIndex.css';

import PlanPage from './plan';
import SpecPage from './spec';
import WorklogPage from './worklog';
import ExcelViewer from './worklog/ExcelTest1';
import ExcelUpload from './worklog/ExcelTest2';
// import StatusPage from './status';
// import LotPage from './lot';

export default function ProductionIndex() {
  const { sub } = MENU_CONFIG.production;

  return (
    <div className='module-page'>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes>
          <Route path='plan/*' element={<PlanPage />} />
          <Route path='spec/*' element={<SpecPage />} />
          {/* <Route path='log' element={<WorklogPage />} /> */}
          <Route path='log/1' element={<ExcelViewer />} />
          <Route path='log/2' element={<ExcelUpload />} />
          {/* <Route path="status" element={<StatusPage />} /> */}
          {/* <Route path="lot" element={<LotPage />} /> */}
        </Routes>
      </div>
    </div>
  );
}
