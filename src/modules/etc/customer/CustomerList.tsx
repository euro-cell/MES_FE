import { useEffect, useState } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../../api/etc/customerService';
import type { Customer, CustomerCreateInput } from '../../../api/etc/customerService';
import { getErrorMessage } from '../../../api/errorHandler';
import styles from '../../../styles/etc/customer.module.css';

const EMPTY_FORM: CustomerCreateInput = {
  name: '',
  shortName: '',
  note: '',
};

interface ModalProps {
  initial?: Customer;
  onClose: () => void;
  onSave: () => void;
}

function CustomerModal({ initial, onClose, onSave }: ModalProps) {
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
          <button className={styles.modalCloseBtn} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.fieldGroup}>
            <label>회사명 *</label>
            <input name='name' value={form.name} onChange={handleChange} placeholder='예: (주)유로셀' />
          </div>
          <div className={styles.fieldGroup}>
            <label>약어 *</label>
            <input name='shortName' value={form.shortName} onChange={handleChange} placeholder='예: EC' maxLength={2} />
          </div>
          <div className={styles.fieldGroup}>
            <label>비고</label>
            <textarea name='note' value={form.note} onChange={handleChange} placeholder='추가 정보를 입력하세요.' />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            취소
          </button>
          <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAdd = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditTarget(customer);
    setShowModal(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`'${customer.name}' 고객사를 삭제하시겠습니까?`)) return;
    try {
      await deleteCustomer(customer.id);
      fetchCustomers();
    } catch (err: any) {
      alert(getErrorMessage(err, '삭제 중 오류가 발생했습니다.'));
    }
  };

  const handleModalSave = () => {
    setShowModal(false);
    setEditTarget(null);
    fetchCustomers();
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditTarget(null);
  };

  if (loading) return <div className='loading'>로딩 중...</div>;
  if (fetchError)
    return <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>서버와 연결할 수 없습니다.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>고객 코드 관리 대장</h2>
        <button className={styles.btnPrimary} onClick={handleAdd}>
          + 고객사 추가
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No</th>
              <th>회사명</th>
              <th>약어</th>
              <th>비고</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  등록된 고객사가 없습니다.
                </td>
              </tr>
            ) : (
              customers.map((c, idx) => (
                <tr key={c.id}>
                  <td>{idx + 1}</td>
                  <td>{c.name}</td>
                  <td>{c.shortName}</td>
                  <td>{c.note}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className={styles.btnSecondary} onClick={() => handleEdit(c)}>
                      수정
                    </button>
                    <button className={styles.btnDanger} onClick={() => handleDelete(c)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CustomerModal initial={editTarget ?? undefined} onClose={handleModalClose} onSave={handleModalSave} />
      )}
    </div>
  );
}
