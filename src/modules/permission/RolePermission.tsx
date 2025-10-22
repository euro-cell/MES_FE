import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/permission.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type RoleType = 'admin' | 'ceo' | 'director' | 'manager' | 'assistant' | 'staff';

interface PermissionCell {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface MenuRolePermission {
  menuId: number;
  menuName: string;
  roles: {
    role: RoleType;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  }[];
}

export default function RolePermission() {
  const [data, setData] = useState<MenuRolePermission[]>([]);
  const [roles, setRoles] = useState<{ key: RoleType; label: string }[]>([]);

  const fetchData = async () => {
    try {
      const [permRes, roleRes] = await Promise.all([
        axios.get(`${API_BASE}/permission/role`, { withCredentials: true }),
        axios.get(`${API_BASE}/permission/roles`, { withCredentials: true }),
      ]);
      setData(permRes.data);
      setRoles(roleRes.data);
    } catch (err) {
      console.error('직급별 권한 조회 실패:', err);
    }
  };

  const toggle = (menuId: number, role: RoleType, field: keyof PermissionCell) => {
    setData(prev =>
      prev.map(menu =>
        menu.menuId === menuId
          ? {
              ...menu,
              roles: menu.roles.map(r => (r.role === role ? { ...r, [field]: !r[field] } : r)),
            }
          : menu
      )
    );
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE}/permission/role`, data, { withCredentials: true });
      alert('✅ 직급별 권한이 저장되었습니다.');
    } catch (err) {
      console.error('직급별 권한 저장 실패:', err);
      alert('❌ 저장 실패');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <h2>직급별 권한</h2>

      <table className='permission-table multi-role'>
        <thead>
          <tr>
            <th rowSpan={2}>메뉴명</th>
            {roles.map(r => (
              <th key={r.key} colSpan={3}>
                {r.label}
              </th>
            ))}
          </tr>
          <tr>
            {roles.map(() => (
              <>
                <th>추가</th>
                <th>수정</th>
                <th>삭제</th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(menu => (
            <tr key={menu.menuId}>
              <td>{menu.menuName}</td>
              {menu.roles.map(r => (
                <>
                  <td>
                    <input
                      type='checkbox'
                      checked={r.canCreate}
                      disabled={r.role === 'admin'}
                      onChange={() => toggle(menu.menuId, r.role, 'canCreate')}
                    />
                  </td>
                  <td>
                    <input
                      type='checkbox'
                      checked={r.canUpdate}
                      disabled={r.role === 'admin'}
                      onChange={() => toggle(menu.menuId, r.role, 'canUpdate')}
                    />
                  </td>
                  <td>
                    <input
                      type='checkbox'
                      checked={r.canDelete}
                      disabled={r.role === 'admin'}
                      onChange={() => toggle(menu.menuId, r.role, 'canDelete')}
                    />
                  </td>
                </>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className='actions'>
        <button onClick={handleSave}>직급 권한 저장</button>
      </div>
    </>
  );
}
