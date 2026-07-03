import { useState } from 'react';
import { createCustomer, updateCustomer } from '../../../api/etc/customerService';
import type { Customer, CustomerCreateInput } from '../../../api/etc/customerService';
import { getErrorMessage } from '../../../api/errorHandler';
import styles from '../../../styles/etc/customer.module.css';

const EMPTY_FORM: CustomerCreateInput = { name: '', shortName: '', note: '' };

interface Props {
  initial?: Customer;
  onClose: () => void;
  onSave: () => void;
}

export default function CustomerModal({ initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<CustomerCreateInput>(
    initial ? { name: initial.name, shortName: initial.shortName, note: initial.note } : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'shortName') {
      if (value.length > 2) return;
      setForm(prev => ({ ...prev, shortName: value.toUpperCase() }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.shortName.trim()) {
      alert('회사명과 약어는 필수 입력 항목입니다.');
      return;
    }
    if (form.shortName.length !== 2) {
      alert('약어는 정확히 2자로 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      if (initial) {
        await updateCustomer(initial.id, form);
      } else {
        await createCustomer(form);
      }
      onSave();
    } catch (err: any) {
      alert(getErrorMessage(err, '저장 중 오류가 발생했습니다.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{initial ? '고객사 수정' : '고객사 추가'}</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.fieldGroup}>
            <label>회사명 *</label>
            <input name='name' value={form.name} onChange={handleChange} placeholder='예: (주)유로셀' />
          </div>
          <div className={styles.fieldGroup}>
            <label>약어 * (2자)</label>
            <input name='shortName' value={form.shortName} onChange={handleChange} placeholder='예: EC' maxLength={2} />
          </div>
          <div className={styles.fieldGroup}>
            <label>비고</label>
            <textarea name='note' value={form.note} onChange={handleChange} placeholder='추가 정보를 입력하세요.' />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>취소</button>
          <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
