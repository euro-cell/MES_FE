import { useEffect, useState } from 'react';
import axios from '../../../api/axiosInstance';
import styles from '../../../styles/etc/permission.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
      const res = await axios.get(`${API_BASE}/permission/user`, { withCredentials: true });
      setUsers(res.data.users);
      setMenus(res.data.menus);
      if (res.data.users.length > 0) {
        setSelectedUserId(res.data.users[0].userId);
      }
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
          : u
      )
    );
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      await axios.put(`${API_BASE}/permission/user`, [selectedUser], { withCredentials: true });
      alert('사용자별 권한이 저장되었습니다.');
    } catch (err) {
      console.error('사용자별 권한 저장 실패:', err);
      alert('저장 실패');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>로딩 중...</p>;
  if (fetchError) return <p style={{ textAlign: 'center', padding: '8px 0', color: '#ef4444' }}>서버와 연결할 수 없습니다.</p>;

  return (
    <div className={styles.permissionSection}>
      <h2>사용자별 권한</h2>

      <div className={styles.userSelector}>
        <label>사용자 선택</label>
        <select
          value={selectedUserId ?? ''}
          onChange={e => setSelectedUserId(Number(e.target.value))}
        >
          {users.map(u => (
            <option key={u.userId} value={u.userId}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
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
      )}

      <div className={styles.actions}>
        <button onClick={handleSave}>사용자 권한 저장</button>
      </div>
    </div>
  );
}
