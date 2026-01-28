import { Route, Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/components/moduleIndex.module.css';
import PlantProductionPage from './production/PlantProductionPage';
import EquipmentList from './register/EquipmentList';
import EquipmentForm from './register/EquipmentForm';

export default function PlantIndex() {
  const { sub } = MENU_CONFIG.plant;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes>
          {/* 생산 설비 - 하위 메뉴 있음 */}
          <Route path='production/*' element={<PlantProductionPage />} />

          {/* 개발 설비 */}
          <Route path='development' element={<EquipmentList category='개발' />} />
          <Route path='development/form' element={<EquipmentForm />} />

          {/* 측정 설비 */}
          <Route path='measurement' element={<EquipmentList category='측정' />} />
          <Route path='measurement/form' element={<EquipmentForm />} />
        </Routes>
      </div>
    </div>
  );
}
