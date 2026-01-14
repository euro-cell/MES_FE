import { Route, Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/moduleIndex.module.css';
import ConditionPage from './condition/ConditionPage';
import UserList from './user/UserList';
import PermissionPage from './perm/PermissionPage';

// 임시 플레이스홀더 컴포넌트
const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: '20px' }}>
    <h2>{title}</h2>
    <p>준비 중입니다.</p>
  </div>
);

export default function EtcIndex() {
  const { sub } = MENU_CONFIG.etc;

  return (
    <div className={styles.modulePage}>
      <SubmenuBar menus={sub} />

      <div className='module-content'>
        <Routes>
          <Route path='users' element={<UserList />} />
          <Route path='permission' element={<PermissionPage />} />
          <Route path='condition/*' element={<ConditionPage />} />
          <Route path='customer' element={<PlaceholderPage title='고객 코드 관리 대장' />} />
        </Routes>
      </div>
    </div>
  );
}
