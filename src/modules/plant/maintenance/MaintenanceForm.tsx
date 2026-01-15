import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../../styles/plant/Equipment.module.css';
import { createMaintenanceRecord, updateMaintenanceRecord } from './MaintenanceService';
import { getEquipments } from '../register/EquipmentService';
import type { MaintenanceRecord, MaintenancePayload } from './MaintenanceTypes';
import type { Equipment } from '../register/EquipmentTypes';

export default function MaintenanceForm() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editingRecord = state?.record as MaintenanceRecord | undefined;
  const isEdit = !!editingRecord;

  const [equipments, setEquipments] = useState<Equipment[]>([]);

  const [formData, setFormData] = useState({
    equipmentId: editingRecord?.equipmentId || 0,
    inspectionDate: editingRecord?.inspectionDate || '',
    replacementHistory: editingRecord?.replacementHistory || '',
    usedParts: editingRecord?.usedParts || '',
    maintainer: editingRecord?.maintainer || '',
    verifier: editingRecord?.verifier || '',
    remark: editingRecord?.remark || '',
  });

  useEffect(() => {
    const loadEquipments = async () => {
      try {
        const data = await getEquipments('생산');
        setEquipments(data);

      } catch (error) {
        console.error('설비 목록 조회 실패:', error);
      }
    };
    loadEquipments();
  }, [editingRecord?.equipmentId]);

  const handleEquipmentSelect = (equipmentId: number) => {
    setFormData(prev => ({ ...prev, equipmentId }));
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.equipmentId || !formData.inspectionDate || !formData.maintainer || !formData.verifier) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const payload: MaintenancePayload = {
      ...formData,
    };

    try {
      if (isEdit && editingRecord) {
        await updateMaintenanceRecord(editingRecord.id, payload);
        alert('수정되었습니다.');
      } else {
        await createMaintenanceRecord(payload);
        alert('등록되었습니다.');
      }
      navigate(-1);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div className={styles.formPage}>
      <div className={styles.formHeader}>
        <h3>유지보수 {isEdit ? '수정' : '등록'}</h3>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>설비 선택 *</label>
          <select
            value={formData.equipmentId || ''}
            onChange={e => handleEquipmentSelect(Number(e.target.value))}
          >
            <option value="">설비를 선택하세요</option>
            {equipments.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.assetNo} / {eq.equipmentNo} / {eq.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>점검일자 *</label>
          <input
            type="date"
            value={formData.inspectionDate}
            onChange={e => handleChange('inspectionDate', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>교체 이력</label>
          <textarea
            value={formData.replacementHistory}
            onChange={e => handleChange('replacementHistory', e.target.value)}
            placeholder="예: 베어링 교체"
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>사용 부품</label>
          <textarea
            value={formData.usedParts}
            onChange={e => handleChange('usedParts', e.target.value)}
            placeholder="예: 베어링 SKF-6205"
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>보수자 *</label>
          <textarea
            value={formData.maintainer}
            onChange={e => handleChange('maintainer', e.target.value)}
            placeholder="보수자명"
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>확인자 *</label>
          <textarea
            value={formData.verifier}
            onChange={e => handleChange('verifier', e.target.value)}
            placeholder="확인자명"
            rows={3}
          />
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label>비고</label>
          <textarea
            value={formData.remark}
            onChange={e => handleChange('remark', e.target.value)}
            placeholder="추가 메모"
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
