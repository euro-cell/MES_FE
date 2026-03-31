import { Route, Routes } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/plant/production/PlantProductionPage.module.css';
import EquipmentList from '../register/EquipmentList';
import EquipmentForm from '../register/EquipmentForm';
import MaintenanceList from '../maintenance/MaintenanceList';
import MaintenanceForm from '../maintenance/MaintenanceForm';

const PRODUCTION_MENUS = [
  { title: '설비 관리 대장', path: '/plant/production/list' },
  { title: '유지보수 관리 대장', path: '/plant/production/history' },
];

export default function PlantProductionPage() {
  return (
    <div>
      <SubmenuBar menus={PRODUCTION_MENUS} />

      <div className={styles.content}>
        <Routes>
          <Route path='list' element={<EquipmentList category='생산' />} />
          <Route path='list/form' element={<EquipmentForm />} />
          <Route path='history' element={<MaintenanceList />} />
          <Route path='history/form' element={<MaintenanceForm />} />
          <Route path='*' element={<div className={styles.placeholder}>메뉴를 선택하세요.</div>} />
        </Routes>
      </div>
    </div>
  );
}
