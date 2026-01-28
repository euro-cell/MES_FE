import { useEffect, useState } from 'react';
import { getUsers, deleteUser, toggleUserActive } from '../../../api/etc/userService';
import type { User } from '../../../api/etc/userService';
import { ROLE_LABELS } from './userRoleMap';
import UserForm from './UserForm';
import styles from '../../../styles/etc/users.module.css';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteUser(id);
      fetchUsers();
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditUser(null);
    fetchUsers();
  };

  const handleToggleActive = async (user: User) => {
    try {
      const newState = !user.isActive;
      await toggleUserActive(user.id, !user.isActive);
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));

      if (newState) {
        alert(`${user.name}님의 계정이 활성화되었습니다.`);
      } else {
        alert(`${user.name}님의 계정이 비활성화되었습니다.`);
      }
    } catch (err) {
      console.error('활성 상태 변경 실패:', err);
      alert('활성 상태 변경 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className='loading'>로딩 중...</div>;

  return (
    <div className={styles.userListContainer}>
      <div className={styles.userListHeader}>
        <h2>인원 전체 리스트</h2>
        <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
          + 인원 추가
        </button>
      </div>

      <table className={styles.userTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>사번</th>
            <th>이름</th>
            <th>부서</th>
            <th>직급</th>
            <th>활성</th>
            <th>등록일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={8} className={styles.empty}>
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.employeeNumber}</td>
                <td>{u.name}</td>
                <td>{u.department}</td>
                <td>{ROLE_LABELS[u.position] || u.position}</td>

                <td
                  className={styles.activeStatus}
                  onClick={() => handleToggleActive(u)}
                  style={{ cursor: 'pointer' }}
                  title='클릭하여 상태 변경'
                >
                  {u.isActive ? 'O' : 'X'}
                </td>

                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className={styles.btnSecondary} onClick={() => handleEdit(u)}>
                    수정
                  </button>
                  <button className={styles.btnDanger} onClick={() => handleDelete(u.id)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showForm && <UserForm onClose={handleFormClose} user={editUser} />}
    </div>
  );
}
