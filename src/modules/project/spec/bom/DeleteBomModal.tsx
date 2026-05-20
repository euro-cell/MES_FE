import { useState } from 'react';
import styles from '../../../../styles/stock/material/deleteMaterialModal.module.css';

interface DeleteBomModalProps {
  show: boolean;
  projectName: string;
  onConfirm: (deleteTemplate: boolean) => void;
  onClose: () => void;
}

export default function DeleteBomModal({ show, projectName, onConfirm, onClose }: DeleteBomModalProps) {
  const [deleteTemplate, setDeleteTemplate] = useState(false);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>셀당 소요량 삭제</h3>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modalContent}>
          <p className={styles.warningText}>{projectName}의 셀당 소요량을 삭제하시겠습니까?</p>
          <div className={styles.deleteOptions}>
            <label className={styles.deleteLabel}>
              <input
                type='checkbox'
                checked={deleteTemplate}
                onChange={e => setDeleteTemplate(e.target.checked)}
                className={styles.hardDeleteCheckbox}
              />
              <span className={styles.labelText}>템플릿 완전 삭제</span>
            </label>
            <p className={styles.deleteDescription}>
              {deleteTemplate
                ? '체크됨: BOM 템플릿 자체가 삭제됩니다. 다른 프로젝트 연결도 모두 끊깁니다.'
                : '체크하지 않음: 이 프로젝트에서만 연결이 해제됩니다. 템플릿은 유지됩니다.'}
            </p>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button className={styles.deleteButton} onClick={() => onConfirm(deleteTemplate)}>
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
