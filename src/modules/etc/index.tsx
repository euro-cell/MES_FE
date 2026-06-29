import { Route, Routes } from 'react-router-dom';
import { MENU_CONFIG } from '../menuConfig';
import SubmenuBar from '../../components/SubmenuBar';
import styles from '../../styles/components/moduleIndex.module.css';
import ConditionPage from './condition/ConditionPage';
import UserList from './user/UserList';
import PermissionPage from './perm/PermissionPage';
import CustomerList from './customer/CustomerList';

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
          <Route path='customer' element={<CustomerList />} />
        </Routes>
      </div>
    </div>
  );
}
