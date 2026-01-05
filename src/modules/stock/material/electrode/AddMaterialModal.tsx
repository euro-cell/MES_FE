import type { ElectrodeMaterial } from './types';
import styles from '../../../../styles/stock/material/addMaterialModal.module.css';

interface AddMaterialModalProps {
  show: boolean;
  formData: Omit<ElectrodeMaterial, 'id'>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function AddMaterialModal({
  show,
  formData,
  onFormChange,
  onSubmit,
  onClose,
}: AddMaterialModalProps) {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>자재 추가</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className={styles.modalForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>분류 (중분류)</label>
              <select
                name="category"
                value={formData.category}
                onChange={onFormChange}
                required
              >
                <option value="">선택</option>
                <option value="바인더">바인더</option>
                <option value="도전재">도전재</option>
                <option value="용매">용매</option>
                <option value="양극재">양극재</option>
                <option value="음극재">음극재</option>
                <option value="집전체">집전체</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>종류 (소분류)</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={onFormChange}
                placeholder="NCM622, LTO 등"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>용도</label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={onFormChange}
                required
              >
                <option value="">선택</option>
                <option value="개발">개발</option>
                <option value="생산">생산</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>제품명</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                placeholder="제품명"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>스펙</label>
              <textarea
                name="spec"
                value={formData.spec}
                onChange={onFormChange}
                placeholder="스펙 정보"
                rows={2}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Lot No.</label>
              <input
                type="text"
                name="lotNo"
                value={formData.lotNo}
                onChange={onFormChange}
                placeholder="Lot No."
              />
            </div>
            <div className={styles.formGroup}>
              <label>제조/공급처</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={onFormChange}
                placeholder="제조/공급처"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>국내/해외</label>
              <select
                name="origin"
                value={formData.origin}
                onChange={onFormChange}
              >
                <option value="국내">국내</option>
                <option value="해외">해외</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>단위</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={onFormChange}
                placeholder="kg, m 등"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>가격</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onFormChange}
                placeholder="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label>재고</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={onFormChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>비고</label>
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={onFormChange}
                placeholder="비고"
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.submitButton}>
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
