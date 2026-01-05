import { useState } from 'react';
import styles from '../../../../styles/stock/material/deleteMaterialModal.module.css';

interface DeleteAssemblyModalProps {
  show: boolean;
  onConfirm: (isHardDelete: boolean) => void;
  onClose: () => void;
}

export default function DeleteAssemblyModal({
  show,
  onConfirm,
  onClose,
}: DeleteAssemblyModalProps) {
  const [isHardDelete, setIsHardDelete] = useState(false);

  if (!show) return null;

  const handleConfirm = () => {
    onConfirm(isHardDelete);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>자재 삭제</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <p className={styles.warningText}>이 자재를 삭제하시겠습니까?</p>

          <div className={styles.deleteOptions}>
            <label className={styles.deleteLabel}>
              <input
                type='checkbox'
                checked={isHardDelete}
                onChange={e => setIsHardDelete(e.target.checked)}
                className={styles.hardDeleteCheckbox}
              />
              <span className={styles.labelText}>완전 삭제</span>
            </label>
            <p className={styles.deleteDescription}>
              {isHardDelete
                ? '✓ 체크됨: 데이터가 완전히 삭제됩니다. 복구할 수 없습니다.'
                : '체크하지 않음: 목록에서만 숨겨집니다. 필요시 복구 가능합니다.'}
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type='button' className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button type='button' className={styles.deleteButton} onClick={handleConfirm}>
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
