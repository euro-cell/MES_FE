import { Navigate, Route, Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/components/moduleIndex.module.css';
import DrawPage from './DrawPage';
import DrawDetailPage from './DrawDetailPage';

export default function DrawIndex() {
  const { sub } = MENU_CONFIG.draw;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes>
          <Route index element={<Navigate to='list' replace />} />
          <Route path='list' element={<DrawPage />} />
          <Route path='detail/:id' element={<DrawDetailPage />} />
        </Routes>
      </div>
    </div>
  );
}
