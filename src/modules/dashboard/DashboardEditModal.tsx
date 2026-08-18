import React, { useEffect, useState } from 'react';
import type { DashboardProject, DashboardFormState } from './types';
import { updateProject } from '../../api/dashboard/DashboardService';
import styles from '../../styles/dashboard/modal.module.css';
import { getErrorMessage } from '../../api/errorHandler';
import { getCustomers } from '../../api/etc/CustomerService';
import type { Customer } from '../../api/etc/CustomerService';

interface Props {
  projects: DashboardProject[];
  onClose: () => void;
  refreshProjects: () => Promise<void>;
}

export default function DashboardEditModal({ projects, onClose, refreshProjects }: Props) {
  const [selected, setSelected] = useState<DashboardProject | null>(null);
  const [form, setForm] = useState<DashboardFormState>({
    company: '',
    customerId: null,
    mode: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    round: 1,
    batteryType: '',
    capacity: '',
    targetQuantity: 0,
  });
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    getCustomers().then(setCustomers).catch(() => {});
  }, []);

  /** ✅ 리스트 클릭 → 폼 세팅 */
  const handleSelect = (project: DashboardProject) => {
    setSelected(project);
    setForm({
      company: project.company || '',
      customerId: project.customerId ?? null,
      mode: project.mode || '',
      year: project.year,
      month: project.month,
      round: project.round,
      batteryType: project.batteryType || '',
      capacity: project.capacity || '',
      targetQuantity: project.targetQuantity || 0,
    });
  };

  /** ✅ 입력값 변경 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /** ✅ 고객사 선택 변경 */
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const shortName = e.target.value;
    const customer = customers.find(c => c.shortName === shortName);
    setForm(prev => ({ ...prev, company: shortName, customerId: customer?.id ?? null }));
  };

  /** ✅ 수정 완료 */
  const handleUpdate = async () => {
    if (!selected) return alert('수정할 프로젝트를 선택하세요.');
    setLoading(true);
    try {
      await updateProject(selected.id, form);
      alert('✅ 수정 완료');
      await refreshProjects();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(getErrorMessage(err, '수정 실패'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles.large}`}>
        <h3>프로젝트 수정</h3>
        <div className={styles.editModalLayout}>
          {/* 🔹 왼쪽: 프로젝트 리스트 */}
          <div className={styles.projectListSection}>
            <ul className={styles.modalList}>
              {projects.map(p => (
                <li key={p.id} onClick={() => handleSelect(p)} className={selected?.id === p.id ? styles.active : ''}>
                  {p.name}
                </li>
              ))}
            </ul>
          </div>

          {/* 🔹 오른쪽: 수정 폼 */}
          <div className={styles.projectEditForm}>
            {selected ? (
              <div>
                <h4>{selected.name} 수정</h4>

                <div className={styles.formRow}>
                  <label>고객사</label>
                  <select name='company' value={form.company} onChange={handleCustomerChange}>
                    <option value=''>선택</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.shortName}>
                        {c.name}({c.shortName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <label>회사 유형</label>
                  <select name='mode' value={form.mode} onChange={handleChange}>
                    <option value=''>선택</option>
                    <option value='OEM'>OEM (E)</option>
                    <option value='ODM'>ODM (D)</option>
                  </select>
                </div>

                <div className={styles.formRow}>
                  <label>생산년도</label>
                  <input type='number' name='year' value={form.year} onChange={handleChange} />
                </div>

                <div className={styles.formRow}>
                  <label>생산월</label>
                  <select name='month' value={form.month} onChange={handleChange}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}월
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formRow}>
                  <label>회차</label>
                  <input type='number' name='round' value={form.round} onChange={handleChange} />
                </div>

                <div className={styles.formRow}>
                  <label>전지 타입</label>
                  <input name='batteryType' value={form.batteryType} onChange={handleChange} />
                </div>

                <div className={styles.formRow}>
                  <label>용량</label>
                  <input type='number' name='capacity' value={form.capacity} onChange={handleChange} />
                </div>

                <div className={styles.formRow}>
                  <label>목표 수량</label>
                  <input type='number' name='targetQuantity' value={form.targetQuantity} onChange={handleChange} />
                </div>

                <div className={styles.modalActions}>
                  <button onClick={handleUpdate} disabled={loading}>
                    {loading ? '수정 중...' : '완료'}
                  </button>
                  <button className={styles.cancelBtn} onClick={onClose}>
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyMsg}>수정할 프로젝트를 선택하세요.</p>
                <button className={styles.cancelBtn} onClick={onClose}>
                  닫기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
