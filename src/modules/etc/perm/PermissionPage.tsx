import { useState } from 'react';
import RolePermission from './RolePermission';
import UserPermission from './UserPermission';
import styles from '../../../styles/etc/permission.module.css';

type Tab = 'role' | 'user';

export default function PermissionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('role');

  return (
    <div className={styles.permissionPage}>
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabButton} ${activeTab === 'role' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('role')}
        >
          직급별
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'user' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('user')}
        >
          사용자별
        </button>
      </div>
      {activeTab === 'role' ? <RolePermission /> : <UserPermission />}
    </div>
  );
}
