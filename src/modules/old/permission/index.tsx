import RolePermission from './RolePermission';
import UserPermission from './UserPermission';
import styles from '../../../styles/permission.module.css';

export default function Permission() {
  return (
    <div className={styles.permissionPage}>
      {/* 상단: 직급별 권한 */}
      <section className={styles.permissionSection}>
        <RolePermission />
      </section>

      {/* 하단: 사용자별 권한 */}
      <section className={styles.permissionSection}>
        <UserPermission />
      </section>
    </div>
  );
}
