import { useState } from 'react';
import type { DashboardProject } from './types';
import { deleteProduction } from './dashboardService';
import styles from '../../styles/dashboard/modal.module.css';

interface Props {
  projects: DashboardProject[];
  onClose: () => void;
  refreshProjects: () => Promise<void>;
}

export default function DashboardDeleteModal({ projects, onClose, refreshProjects }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!selectedId) return alert('삭제할 프로젝트를 선택하세요.');
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setLoading(true);
    try {
      await deleteProduction(selectedId);
      alert('🗑️ 삭제 완료');
      await refreshProjects();
      onClose();
    } catch (err) {
      console.error(err);
      alert('삭제 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>프로젝트 삭제</h3>
        <ul className={styles.modalList}>
          {projects.map(p => (
            <li key={p.id} onClick={() => setSelectedId(p.id)} className={selectedId === p.id ? styles.active : ''}>
              {p.name}
            </li>
          ))}
        </ul>
        <div className={styles.modalActions}>
          <button onClick={handleDelete} disabled={loading}>
            {loading ? '삭제 중...' : '삭제'}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
