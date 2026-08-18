import { useState } from 'react';
import { changePassword } from '../../../api/etc/UserService';
import type { User } from '../../../api/etc/UserService';
import styles from '../../../styles/etc/users.module.css';
import { getErrorMessage } from '../../../api/errorHandler';

interface Props {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PasswordChangeModal({ user, onClose, onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(user.id, password);
      alert(`${user.name}님의 비밀번호가 변경되었습니다.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(getErrorMessage(err, '비밀번호 변경 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal} style={{ maxWidth: '380px' }}>
        <div className={styles.modalHeader}>
          <h3>{user.name}님 비밀번호 변경</h3>
          <button className={styles.modalCloseBtn} onClick={onClose} type='button'>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody} style={{ gap: '8px', padding: '12px 20px' }}>
            <div className={styles.fieldGroup}>
              <label>새 비밀번호</label>
              <input
                type='password'
                placeholder='새 비밀번호 입력'
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type='button' className={styles.btnSecondary} onClick={onClose} disabled={loading}>
              취소
            </button>
            <button type='submit' className={styles.btnPrimary} disabled={loading}>
              {loading ? '변경 중...' : '변경'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
