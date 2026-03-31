import { Route, Routes } from 'react-router-dom';
import SubmenuBar from '../../../components/SubmenuBar';
import styles from '../../../styles/etc/condition/ConditionPage.module.css';

const CONDITION_MENUS = [{ title: '공정 온/습도', path: '/etc/condition/humidity' }];

// 공정 온/습도 페이지
const HumidityPage = () => (
  <div>
    <img src='/1.svg' />
  </div>
);

export default function ConditionPage() {
  return (
    <div>
      <SubmenuBar menus={CONDITION_MENUS} />

      <div className={styles.content}>
        <Routes>
          <Route path='humidity' element={<HumidityPage />} />
          <Route path='*' element={<div className={styles.placeholder}>메뉴를 선택하세요.</div>} />
        </Routes>
      </div>
    </div>
  );
}
