import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import styles from '../../styles/draw/Drawing.module.css';
import { updateDrawing } from '../../api/draw/DrawService';
import type { DrawingCategory, DrawingListItem, DrawingUpdatePayload } from './DrawTypes';

const CATEGORY_OPTIONS: DrawingCategory[] = ['공장', '설비', '제품', 'OEM/ODM'];

interface DrawingEditModalProps {
  isOpen: boolean;
  item: DrawingListItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DrawingEditModal({ isOpen, item, onClose, onSuccess }: DrawingEditModalProps) {
  const [formData, setFormData] = useState<DrawingUpdatePayload>({
    category: '공장',
    projectName: '',
    division: '',
    drawingNumber: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category,
        projectName: item.projectName,
        division: item.division,
        drawingNumber: item.drawingNumber,
        description: item.description || '',
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    try {
      setSubmitting(true);
      await updateDrawing(item.id, formData);
      toast.success('도면이 수정되었습니다.');
      onClose();
      onSuccess();
    } catch (err) {
      console.error('도면 수정 실패:', err);
      toast.error('도면 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>도면 수정</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <label>카테고리 *</label>
              <select name='category' value={formData.category} onChange={handleInputChange} required>
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formRow}>
              <label>프로젝트명 *</label>
              <input
                type='text'
                name='projectName'
                value={formData.projectName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formRow}>
              <label>구분 *</label>
              <input
                type='text'
                name='division'
                value={formData.division}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formRow}>
              <label>도면번호 *</label>
              <input
                type='text'
                name='drawingNumber'
                value={formData.drawingNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={`${styles.formRow} ${styles.fullWidth}`}>
              <label>도면 내용</label>
              <textarea name='description' value={formData.description} onChange={handleInputChange} rows={2} />
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type='button' className={styles.cancelButton} onClick={onClose}>
              취소
            </button>
            <button type='submit' className={styles.submitButton} disabled={submitting}>
              {submitting ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
