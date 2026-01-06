import type { AssemblyMaterial } from './types';
import styles from '../../../../styles/stock/material/addMaterialModal.module.css';

interface AddAssemblyModalProps {
  show: boolean;
  isEditing: boolean;
  formData: Omit<AssemblyMaterial, 'id'>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function AddAssemblyModal({
  show,
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  onClose,
}: AddAssemblyModalProps) {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{isEditing ? '자재 수정' : '자재 추가'}</h3>
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
                disabled={isEditing}
              >
                <option value="">선택</option>
                <option value="분리막">분리막</option>
                <option value="전해액">전해액</option>
                <option value="파우치">파우치</option>
                <option value="리드탭">리드탭</option>
                <option value="원통형">원통형</option>
                <option value="코인셀부품">코인셀부품</option>
                <option value="테이프">테이프</option>
                <option value="각형">각형</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>종류 (소분류)</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={onFormChange}
                placeholder="예시, 타입 등"
                required
                disabled={isEditing}
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
                disabled={isEditing}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>규격</label>
              <textarea
                name="spec"
                value={formData.spec}
                onChange={onFormChange}
                placeholder="규격 정보"
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
                disabled={isEditing}
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
                disabled={isEditing}
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
                disabled={isEditing}
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
              {isEditing ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
