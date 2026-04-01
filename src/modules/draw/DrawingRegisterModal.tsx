import React, { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import styles from '../../styles/draw/Drawing.module.css';
import { createDrawing } from '../../api/draw/DrawService';
import type { DrawingCategory, DrawingCreatePayload } from './DrawTypes';

const CATEGORY_OPTIONS: DrawingCategory[] = ['공장', '설비', '제품', 'OEM/ODM'];

type FormData = Omit<DrawingCreatePayload, 'drawingFile' | 'pdfFiles' | 'version'> & {
  drawingFile: File | null;
  pdfFiles: File[];
  version: number | '';
};

const INITIAL_FORM: FormData = {
  category: '공장',
  projectName: '',
  division: '',
  drawingNumber: '',
  description: '',
  version: '',
  registrationDate: new Date().toISOString().split('T')[0],
  changeNote: '',
  drawingFile: null,
  pdfFiles: [],
};

interface DrawingRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isAddMode?: boolean;
  defaultCategory?: DrawingCategory;
  defaultProjectName?: string;
}

export default function DrawingRegisterModal({
  isOpen,
  onClose,
  onSuccess,
  isAddMode = false,
  defaultCategory,
  defaultProjectName,
}: DrawingRegisterModalProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // 모달이 열릴 때 formData 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...INITIAL_FORM,
        category: defaultCategory || '공장',
        projectName: defaultProjectName || '',
      });
    }
  }, [isOpen, defaultCategory, defaultProjectName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'version') {
      const numValue: number | '' = value === '' ? '' : parseFloat(value);
      setFormData(prev => ({ ...prev, version: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'pdfFiles') {
        setFormData(prev => ({ ...prev, pdfFiles: Array.from(files) }));
      } else {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await createDrawing({
        ...formData,
        version: formData.version as number,
        drawingFile: formData.drawingFile || undefined,
        pdfFiles: formData.pdfFiles.length > 0 ? formData.pdfFiles : undefined,
      });
      toast.success('도면이 등록되었습니다.');
      handleClose();
      onSuccess();
    } catch (err) {
      console.error('도면 등록 실패:', err);
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error('이미 존재하는 도면번호입니다.');
      } else {
        toast.error('도면 등록에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      ...INITIAL_FORM,
      category: defaultCategory || '공장',
      projectName: defaultProjectName || '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>도면 등록</h3>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            {!isAddMode && (
              <>
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
                    placeholder='예: 오산, 화성'
                    required
                  />
                </div>
              </>
            )}
            <div className={styles.formRow}>
              <label>구분 *</label>
              <input
                type='text'
                name='division'
                value={formData.division}
                onChange={handleInputChange}
                placeholder='예: 1층, 2층, A동'
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
            <div className={styles.formRow}>
              <label>버전 *</label>
              <input
                type='number'
                step='0.1'
                name='version'
                value={formData.version}
                onChange={handleInputChange}
                placeholder='예: 1.0, 2.0'
                required
              />
            </div>
            <div className={styles.formRow}>
              <label>등록일자 *</label>
              <input
                type='date'
                name='registrationDate'
                value={formData.registrationDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={`${styles.formRow} ${styles.fullWidth}`}>
              <label>도면 내용</label>
              <textarea name='description' value={formData.description} onChange={handleInputChange} rows={2} />
            </div>
            <div className={`${styles.formRow} ${styles.fullWidth}`}>
              <label>변경 사유</label>
              <input type='text' name='changeNote' value={formData.changeNote} onChange={handleInputChange} />
            </div>
            <div className={styles.formRow}>
              <label>도면 파일 (dwg/dxf)</label>
              <input type='file' name='drawingFile' accept='.dwg,.dxf' onChange={handleFileChange} />
            </div>
            <div className={styles.formRow}>
              <label>PDF 파일 (다중 선택 가능)</label>
              <input type='file' name='pdfFiles' accept='.pdf' onChange={handleFileChange} multiple />
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type='button' className={styles.cancelButton} onClick={handleClose}>
              취소
            </button>
            <button type='submit' className={styles.submitButton} disabled={submitting}>
              {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
