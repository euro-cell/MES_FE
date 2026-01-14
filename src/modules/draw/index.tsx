import { Route, Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/moduleIndex.module.css';
import DrawListPage from './list/DrawListPage';
import CellDrawingIndex from './cell';
import DrawingLedgerPage from './ledger/DrawingLedgerPage';

export default function DrawIndex() {
  const { sub } = MENU_CONFIG.draw;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes>
          <Route path='factory' element={<DrawListPage />} />
          <Route path='cell/*' element={<CellDrawingIndex />} />
          <Route path='list' element={<DrawingLedgerPage />} />
        </Routes>
      </div>
    </div>
  );
}
