import { Route, Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/moduleIndex.module.css';
import LQCIndex from './lqc';
import OQCIndex from './oqc';

export default function QualityIndex() {
  const { sub } = MENU_CONFIG.quality;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes>
          <Route path='lqc/*' element={<LQCIndex />} />
          <Route path='oqc/*' element={<OQCIndex />} />
        </Routes>
      </div>
    </div>
  );
}
