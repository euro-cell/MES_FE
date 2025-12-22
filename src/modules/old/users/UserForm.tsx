import { useState } from 'react';
import { createUser, updateUser } from './userService';
import type { User } from './userService';
import { ROLE_LABELS } from './userRoleMap';
import styles from '../../../styles/users.module.css';

interface Props {
  user?: User | null;
  onClose: () => void;
}

export default function UserForm({ user, onClose }: Props) {
  const isEdit = !!user;

  const [form, setForm] = useState({
    name: user?.name || '',
    employeeNumber: user?.employeeNumber || '',
    department: user?.department || '',
    position: user?.position || 'staff',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        const updateData: Record<string, any> = { ...form };
        if (!form.password.trim()) delete updateData.password;
        await updateUser(user.id, updateData);
        alert('수정 완료');
      } else {
        if (!form.password.trim()) {
          alert('비밀번호를 입력해주세요.');
          return;
        }
        await createUser(form);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h3>{isEdit ? '인원 수정' : '인원 추가'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            name='employeeNumber'
            placeholder='사번'
            value={form.employeeNumber}
            onChange={handleChange}
            required
          />
          <input type='text' name='name' placeholder='이름' value={form.name} onChange={handleChange} required />
          <input
            type='text'
            name='department'
            placeholder='부서'
            value={form.department}
            onChange={handleChange}
            required
          />

          {/* ✅ 직급 선택 */}
          <div>
            <select name='position' value={form.position} onChange={handleChange} size={5}>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ 비밀번호 입력 (수정 시 선택 사항) */}
          <input
            type='password'
            name='password'
            placeholder={isEdit ? '비밀번호 (변경 시만 입력)' : '비밀번호'}
            value={form.password}
            onChange={handleChange}
            required={!isEdit}
          />

          <div className={styles.modalButtons}>
            <button type='submit' className={styles.btnPrimary}>
              저장
            </button>
            <button type='button' className={styles.btnSecondary} onClick={onClose}>
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
