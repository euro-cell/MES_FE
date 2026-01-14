import { Route, Routes } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/quality/lqc/LQCPage.module.css';
import EquipmentList from '../register/EquipmentList';
import EquipmentForm from '../register/EquipmentForm';

const PRODUCTION_MENUS = [
  { title: '설비 관리 대장', path: '/plant/production/list' },
  { title: '유지보수 관리 대장', path: '/plant/production/history' },
];

// 임시 플레이스홀더 컴포넌트
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className={styles.placeholder}>{title} - 준비 중입니다.</div>
);

export default function PlantProductionPage() {
  return (
    <div>
      <SubmenuBar menus={PRODUCTION_MENUS} />

      <div className={styles.content}>
        <Routes>
          <Route path='list' element={<EquipmentList category='생산' />} />
          <Route path='list/form' element={<EquipmentForm />} />
          <Route path='history' element={<PlaceholderPage title='유지보수 관리 대장' />} />
          <Route path='*' element={<div className={styles.placeholder}>메뉴를 선택하세요.</div>} />
        </Routes>
      </div>
    </div>
  );
}
