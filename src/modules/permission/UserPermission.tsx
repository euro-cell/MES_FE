import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/permission.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface PermissionCell {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface UserPermission {
  userId: number;
  name: string;
  menus: Record<string, PermissionCell>;
}

export default function UserPermission() {
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [menus, setMenus] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/permission/user/all`, { withCredentials: true });
      setUsers(res.data.users);
      setMenus(res.data.menus);
    } catch (err) {
      console.error('사용자별 권한 조회 실패:', err);
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
      await axios.put(`${API_BASE}/permission/user/all`, users, { withCredentials: true });
      alert('✅ 사용자별 권한이 저장되었습니다.');
    } catch (err) {
      console.error('사용자별 권한 저장 실패:', err);
      alert('❌ 저장 실패');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <h2>사용자별 권한</h2>

      <table className='permission-table'>
        <thead>
          <tr>
            <th rowSpan={2}>ID</th>
            <th rowSpan={2}>이름</th>
            {menus.map(m => (
              <th key={m} colSpan={3}>
                {m}
              </th>
            ))}
          </tr>
          <tr>
            {menus.map(() => (
              <>
                <th>추가</th>
                <th>수정</th>
                <th>삭제</th>
              </>
            ))}
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.name}</td>
              {menus.map(m => (
                <>
                  <td>
                    <input
                      type='checkbox'
                      checked={u.menus[m]?.canCreate ?? false}
                      onChange={() => toggle(u.userId, m, 'canCreate')}
                    />
                  </td>
                  <td>
                    <input
                      type='checkbox'
                      checked={u.menus[m]?.canUpdate ?? false}
                      onChange={() => toggle(u.userId, m, 'canUpdate')}
                    />
                  </td>
                  <td>
                    <input
                      type='checkbox'
                      checked={u.menus[m]?.canDelete ?? false}
                      onChange={() => toggle(u.userId, m, 'canDelete')}
                    />
                  </td>
                </>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className='actions'>
        <button onClick={handleSave}>사용자 권한 저장</button>
      </div>
    </>
  );
}
