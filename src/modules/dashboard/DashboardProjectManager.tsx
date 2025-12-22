import React, { useState } from 'react';
import type { DashboardFormState, DashboardProject } from './types';
import DashboardEditModal from './DashboardEditModal';
import DashboardDeleteModal from './DashboardDeleteModal';
import styles from '../../styles/dashboard/manager.module.css';

interface Props {
  form: DashboardFormState;
  setForm: React.Dispatch<React.SetStateAction<DashboardFormState>>;
  onSubmit: (data: DashboardFormState) => Promise<void>;
  refreshProjects: () => Promise<void>;
  projects: DashboardProject[];
}

export default function DashboardProjectManager({ form, setForm, onSubmit, refreshProjects, projects }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  /** ✅ 입력 변경 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /** ✅ 등록 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(form);
      alert('프로젝트 등록 완료 ✅');
      await refreshProjects();
      setForm({
        company: '',
        mode: '',
        year: new Date().getFullYear(),
        month: 1,
        round: 1,
        batteryType: '',
        capacity: '',
        targetQuantity: 0,
      });
    } catch (err) {
      console.error('등록 실패:', err);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.dashboardProjectManager}>
      {/* ✅ 제목 + 버튼 */}
      <div className={styles.managerHeader}>
        <h3>프로젝트 관리</h3>
        <div className={styles.managerHeaderActions}>
          <button type='button' className={styles.editOpenBtn} onClick={() => setShowEdit(true)}>
            수정
          </button>
          <button type='button' className={styles.deleteOpenBtn} onClick={() => setShowDelete(true)}>
            삭제
          </button>
        </div>
      </div>

      {/* ✅ 등록 폼 */}
      <form onSubmit={handleSubmit} className={styles.managerForm}>
        <div className={styles.formRow}>
          <label>회사 약어</label>
          <input type='text' name='company' value={form.company} onChange={handleChange} placeholder='예: NA' />
        </div>

        <div className={styles.formRow}>
          <label>회사 유형</label>
          <select name='mode' value={form.mode} onChange={handleChange}>
            <option value=''>선택</option>
            <option value='OME'>OME (E)</option>
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
          <input
            type='text'
            name='batteryType'
            value={form.batteryType}
            onChange={handleChange}
            placeholder='예: TNP'
          />
        </div>

        <div className={styles.formRow}>
          <label>용량</label>
          <input type='number' name='capacity' value={form.capacity} onChange={handleChange} placeholder='예: 38' />
        </div>

        <div className={styles.formRow}>
          <label>목표 수량</label>
          <input
            type='number'
            name='targetQuantity'
            value={form.targetQuantity}
            onChange={handleChange}
            placeholder='예: 1000'
          />
        </div>

        <button type='submit' className={styles.managerBtn}>
          등록하기
        </button>
      </form>

      {/* ✅ 모달 */}
      {showEdit && (
        <DashboardEditModal projects={projects} onClose={() => setShowEdit(false)} refreshProjects={refreshProjects} />
      )}
      {showDelete && (
        <DashboardDeleteModal
          projects={projects}
          onClose={() => setShowDelete(false)}
          refreshProjects={refreshProjects}
        />
      )}
    </div>
  );
}
