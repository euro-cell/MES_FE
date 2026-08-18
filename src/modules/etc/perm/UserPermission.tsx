import { useEffect, useState } from 'react';
import { fetchUserPermissions, updateUserPermission } from '../../../api/etc/PermissionService';
import styles from '../../../styles/etc/permission.module.css';
import { getErrorMessage } from '../../../api/errorHandler';

interface PermissionCell {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface MenuItem {
  name: string;
  depth: number;
}

interface UserPermission {
  userId: number;
  name: string;
  menus: Record<string, PermissionCell>;
}

export default function UserPermission() {
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchUserPermissions();
      setUsers(data.users);
      setMenus(data.menus);
    } catch (err) {
      console.error('사용자별 권한 조회 실패:', err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(u => u.userId === selectedUserId) ?? null;

  const toggle = (menu: string, field: keyof PermissionCell) => {
    if (!selectedUser) return;
    setUsers(prev =>
      prev.map(u =>
        u.userId === selectedUserId
          ? {
              ...u,
              menus: {
                ...u.menus,
                [menu]: {
                  ...u.menus[menu],
                  [field]: !u.menus[menu][field],
                },
              },
            }
          : u,
      ),
    );
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      await updateUserPermission([selectedUser]);
      alert('사용자별 권한이 저장되었습니다.');
    } catch (err: any) {
      console.error('사용자별 권한 저장 실패:', err);
      alert(getErrorMessage(err, '저장 실패'));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (fetchError)
    return <p style={{ textAlign: 'center', padding: '8px 0', color: '#ef4444' }}>서버와 연결할 수 없습니다.</p>;

  return (
    <div className={styles.permissionSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <h2>사용자별 권한</h2>
          <div className={styles.userSelector}>
            <label>사용자 선택</label>
            <select value={selectedUserId ?? ''} onChange={e => setSelectedUserId(Number(e.target.value) || null)}>
              <option value="">사용자를 선택해주세요</option>
              {users.map(u => (
                <option key={u.userId} value={u.userId}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className={styles.saveButton} onClick={handleSave}>
          사용자 권한 저장
        </button>
      </div>

      {selectedUser && (
        <div className={styles.tableWrapper}>
          <table className={styles.permissionTable}>
          <thead>
            <tr>
              <th>메뉴</th>
              <th>추가</th>
              <th>수정</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {menus.map(m => {
              const perm = selectedUser.menus[m.name];
              return (
                <tr key={m.name} className={styles[`menuDepth${m.depth}`]}>
                  <td>{m.name}</td>
                  <td>
                    <input
                      type='checkbox'
                      checked={perm?.canCreate ?? false}
                      onChange={() => toggle(m.name, 'canCreate')}
                    />
                  </td>
                  <td>
                    <input
                      type='checkbox'
                      checked={perm?.canUpdate ?? false}
                      onChange={() => toggle(m.name, 'canUpdate')}
                    />
                  </td>
                  <td>
                    <input
                      type='checkbox'
                      checked={perm?.canDelete ?? false}
                      onChange={() => toggle(m.name, 'canDelete')}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
