import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
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
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/permission/user`, { withCredentials: true });
      setUsers(res.data.users);
      setMenus(res.data.menus);
    } catch (err) {
      console.error('사용자별 권한 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (userId: number, menu: string, field: keyof PermissionCell) => {
    setUsers(prev =>
      prev.map(u =>
        u.userId === userId
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
    try {
      await axios.put(`${API_BASE}/permission/user`, users, { withCredentials: true });
      alert('사용자별 권한이 저장되었습니다.');
    } catch (err) {
      console.error('사용자별 권한 저장 실패:', err);
      alert('저장 실패');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <p>로딩 중...</p>;
  }

  return (
    <>
      <h2>사용자별 권한</h2>

      <table className={styles.permissionTable}>
        <thead>
          <tr>
            <th rowSpan={2}>ID</th>
            <th rowSpan={2}>이름</th>
            {menus.map(m => (
              <th key={m.name} colSpan={3}>
                {m.name}
              </th>
            ))}
          </tr>
          <tr>
            {menus.map((_m, idx) => (
              <React.Fragment key={`sub-${idx}`}>
                <th>추가</th>
                <th>수정</th>
                <th>삭제</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.name}</td>
              {menus.map(m => (
                <React.Fragment key={`${u.userId}-${m.name}`}>
                  <td>
                    <input
                      type='checkbox'
                      checked={u.menus[m.name]?.canCreate ?? false}
                      onChange={() => toggle(u.userId, m.name, 'canCreate')}
                    />
                  </td>
                  <td>
                    <input
                      type='checkbox'
                      checked={u.menus[m.name]?.canUpdate ?? false}
                      onChange={() => toggle(u.userId, m.name, 'canUpdate')}
                    />
                  </td>
                  <td>
                    <input
                      type='checkbox'
                      checked={u.menus[m.name]?.canDelete ?? false}
                      onChange={() => toggle(u.userId, m.name, 'canDelete')}
                    />
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.actions}>
        <button onClick={handleSave}>사용자 권한 저장</button>
      </div>
    </>
  );
}
