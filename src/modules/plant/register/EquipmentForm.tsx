import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../../styles/plant/Equipment.module.css';
import { createEquipment, updateEquipment } from './EquipmentService';
import type { Equipment, EquipmentCategory, EquipmentPayload } from './EquipmentTypes';

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  '생산': '생산 설비',
  '개발': '개발 설비',
  '측정': '측정 설비',
};

const GRADES = ['A', 'B', 'C'];
const MAINTENANCE_METHODS = ['정기점검', '수시점검', '교정', '자체점검'];

export default function EquipmentForm() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editingEquipment = state?.equipment as Equipment | undefined;
  const category = (state?.category || editingEquipment?.category || '생산') as EquipmentCategory;
  const isEdit = !!editingEquipment;

  const [formData, setFormData] = useState<Omit<EquipmentPayload, 'category'>>({
    assetNo: editingEquipment?.assetNo || '',
    equipmentNo: editingEquipment?.equipmentNo || '',
    name: editingEquipment?.name || '',
    manufacturer: editingEquipment?.manufacturer || '',
    purchaseDate: editingEquipment?.purchaseDate || '',
    grade: editingEquipment?.grade || 'A',
    maintenanceMethod: editingEquipment?.maintenanceMethod || '정기점검',
    remark: editingEquipment?.remark || '',
    deviceNo: editingEquipment?.deviceNo || '',
    calibrationDate: editingEquipment?.calibrationDate || '',
    nextCalibrationDate: editingEquipment?.nextCalibrationDate || '',
    calibrationAgency: editingEquipment?.calibrationAgency || '',
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.assetNo || !formData.equipmentNo || !formData.name || !formData.manufacturer || !formData.purchaseDate) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const payload: EquipmentPayload = { ...formData, category };

    try {
      if (isEdit && editingEquipment) {
        await updateEquipment(editingEquipment.id, payload);
        alert('수정되었습니다.');
      } else {
        await createEquipment(payload);
        alert('등록되었습니다.');
      }
      navigate(-1);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const isMeasurement = category === '측정';

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <h3>{CATEGORY_LABELS[category]} {isEdit ? '수정' : '등록'}</h3>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>자산번호 *</label>
          <input
            type="text"
            value={formData.assetNo}
            onChange={e => handleChange('assetNo', e.target.value)}
            placeholder="예: A-2024-001"
          />
        </div>

        <div className={styles.formGroup}>
          <label>설비번호 *</label>
          <input
            type="text"
            value={formData.equipmentNo}
            onChange={e => handleChange('equipmentNo', e.target.value)}
            placeholder="예: EQ-P-001"
          />
        </div>

        <div className={styles.formGroup}>
          <label>설비명 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="설비명 입력"
          />
        </div>

        <div className={styles.formGroup}>
          <label>제조사 *</label>
          <input
            type="text"
            value={formData.manufacturer}
            onChange={e => handleChange('manufacturer', e.target.value)}
            placeholder="제조사명 입력"
          />
        </div>

        <div className={styles.formGroup}>
          <label>구입일자 *</label>
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={e => handleChange('purchaseDate', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>설비등급</label>
          <select
            value={formData.grade}
            onChange={e => handleChange('grade', e.target.value)}
          >
            {GRADES.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>보전방법</label>
          <select
            value={formData.maintenanceMethod}
            onChange={e => handleChange('maintenanceMethod', e.target.value)}
          >
            {MAINTENANCE_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        {isMeasurement && (
          <div className={styles.calibrationSection}>
            <h4>교정 정보</h4>
            <div className={styles.calibrationFields}>
              <div className={styles.formGroup}>
                <label>기기번호</label>
                <input
                  type="text"
                  value={formData.deviceNo || ''}
                  onChange={e => handleChange('deviceNo', e.target.value)}
                  placeholder="예: DC-001"
                />
              </div>

              <div className={styles.formGroup}>
                <label>교정일</label>
                <input
                  type="date"
                  value={formData.calibrationDate || ''}
                  onChange={e => handleChange('calibrationDate', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>차기 교정일</label>
                <input
                  type="date"
                  value={formData.nextCalibrationDate || ''}
                  onChange={e => handleChange('nextCalibrationDate', e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>검교정 기관</label>
                <input
                  type="text"
                  value={formData.calibrationAgency || ''}
                  onChange={e => handleChange('calibrationAgency', e.target.value)}
                  placeholder="예: KOLAS 인증기관"
                />
              </div>
            </div>
          </div>
        )}

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label>비고</label>
          <textarea
            value={formData.remark || ''}
            onChange={e => handleChange('remark', e.target.value)}
            placeholder="추가 메모 입력"
          />
        </div>

        <div className={styles.formActions}>
          <button className={styles.cancelBtn} onClick={() => navigate(-1)}>
            취소
          </button>
          <button className={styles.saveBtn} onClick={handleSubmit}>
            {isEdit ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}
