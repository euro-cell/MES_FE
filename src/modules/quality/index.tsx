import { Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/moduleIndex.module.css';

export default function QualityIndex() {
  const { sub } = MENU_CONFIG.quality;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes></Routes>
      </div>
    </div>
  );
}
