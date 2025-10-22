import RolePermission from './RolePermission';
import UserPermission from './UserPermission';
import '../../styles/permission.css';

export default function Permission() {
  return (
    <div className='permission-page'>
      {/* 상단: 직급별 권한 */}
      <section className='permission-section'>
        <RolePermission />
      </section>

      {/* 하단: 사용자별 권한 */}
      <section className='permission-section'>
        <UserPermission />
      </section>
    </div>
  );
}
