import RolePermission from './RolePermission';
import UserPermission from './UserPermission';
import styles from '../../../styles/etc/permission.module.css';

export default function PermissionPage() {
  return (
    <div className={styles.permissionPage}>
      <section className={styles.permissionSection}>
        <RolePermission />
      </section>

      <section className={styles.permissionSection}>
        <UserPermission />
      </section>
    </div>
  );
}
