import styles from '../../../../styles/project/worklog/MixingInfoModal.module.css';
import footerStyles from '../../../../styles/project/worklog/SpecificationMissingModal.module.css';

interface SpecificationMissingModalProps {
  reason: 'notFound' | 'empty';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SpecificationMissingModal({ reason, onConfirm, onCancel }: SpecificationMissingModalProps) {
  const message =
    reason === 'notFound'
      ? '해당 생산 계획을 찾을 수 없습니다.\n자재투입정보를 직접입력 하시겠습니까?'
      : '설계정보가 정확하게 등록되어 있지 않습니다.\n자재투입정보를 직접입력 하시겠습니까?';

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal} style={{ maxWidth: 420 }}>
        <div className={styles.modalHeader}>
          <h3>설계정보 확인 필요</h3>
          <button className={styles.closeButton} onClick={onCancel}>
            &times;
          </button>
        </div>
        <div className={styles.modalContent} style={{ padding: 20 }}>
          <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
        </div>
        <div className={footerStyles.footer}>
          <button className={footerStyles.cancelButton} onClick={onCancel}>
            취소
          </button>
          <button className={footerStyles.confirmButton} onClick={onConfirm}>
            직접입력
          </button>
        </div>
      </div>
    </div>
  );
}
