import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../styles/permission.css';
import { ROLE_LABELS } from '../users/userRoleMap';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type RoleType = keyof typeof ROLE_LABELS;

interface PermissionCell {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface RoleMenuPermission {
  role: RoleType;
  menus: Record<string, PermissionCell>;
}

export default function RolePermission() {
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [menus, setMenus] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<RoleMenuPermission[]>([]);
  const [loading, setLoading] = useState(true);

  /** ✅ 전체 직급별 권한 조회 */
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/permission/role`, { withCredentials: true });

      setMenus(res.data.menus);
      setPermissions(res.data.roles);
      setRoles(res.data.roles.map((r: any) => r.role));
    } catch (err) {
      console.error('❌ 직급별 권한 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 체크박스 토글 */
  const toggle = (role: RoleType, menu: string, field: keyof PermissionCell) => {
    setPermissions(prev =>
      prev.map(r =>
        r.role === role
          ? {
              ...r,
              menus: {
                ...r.menus,
                [menu]: {
                  ...r.menus[menu],
                  [field]: !r.menus[menu][field],
                },
              },
            }
          : r
      )
    );
  };

  /** ✅ 변경사항 저장 */
  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE}/permission/role`, permissions, { withCredentials: true });
      alert('✅ 직급별 권한이 저장되었습니다.');
    } catch (err) {
      console.error('❌ 직급별 권한 저장 실패:', err);
      alert('❌ 저장 실패');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className='permission-section'>
      <h2>직급별 권한</h2>

      <table className='permission-table'>
        <thead>
          <tr>
            <th rowSpan={2}>직급</th>
            {menus.map(m => (
              <th key={m} colSpan={3}>
                {m}
              </th>
            ))}
          </tr>
          <tr>
            {menus.map(m => (
              <React.Fragment key={`${m}-sub`}>
                <th>추가</th>
                <th>수정</th>
                <th>삭제</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map(rolePerm => (
            <tr key={rolePerm.role}>
              <td>{ROLE_LABELS[rolePerm.role]}</td>
              {menus.map(m => {
                const perm = rolePerm.menus[m];
                const isAdmin = rolePerm.role === 'admin';
                return (
                  <React.Fragment key={`${rolePerm.role}-${m}`}>
                    <td>
                      <input
                        type='checkbox'
                        checked={perm?.canCreate ?? false}
                        disabled={isAdmin}
                        onChange={() => toggle(rolePerm.role, m, 'canCreate')}
                      />
                    </td>
                    <td>
                      <input
                        type='checkbox'
                        checked={perm?.canUpdate ?? false}
                        disabled={isAdmin}
                        onChange={() => toggle(rolePerm.role, m, 'canUpdate')}
                      />
                    </td>
                    <td>
                      <input
                        type='checkbox'
                        checked={perm?.canDelete ?? false}
                        disabled={isAdmin}
                        onChange={() => toggle(rolePerm.role, m, 'canDelete')}
                      />
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className='actions'>
        <button onClick={handleSave}>직급 권한 저장</button>
      </div>
    </div>
  );
}
