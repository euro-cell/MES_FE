import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { changePassword } from '../api/profile/profileService';
import { ROLE_LABELS } from '../modules/etc/user/userRoleMap';
import styles from '../styles/pages/profile.module.css';

export default function ProfilePage() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setConfirmError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    // if (newPassword.length < 4) {
    //   setConfirmError('비밀번호는 4자 이상이어야 합니다.');
    //   return;
    // }
    setConfirmError('');

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('비밀번호가 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>내 정보</h2>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>기본 정보</div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>이름</span>
          <span>{user?.name ?? '-'}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>사번</span>
          <span>{user?.employeeNumber ?? '-'}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>부서</span>
          <span>{user?.department ?? '-'}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>직급</span>
          <span>{user?.role ? ROLE_LABELS[user.role] || user.role : '-'}</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>비밀번호 변경</div>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>현재 비밀번호</label>
            <input
              type='password'
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>새 비밀번호</label>
            <input type='password' value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>새 비밀번호 확인</label>
            <input
              type='password'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            {confirmError && <div className={styles.errorMsg}>{confirmError}</div>}
          </div>
          <button type='submit' className={styles.submitBtn} disabled={loading}>
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  );
}
