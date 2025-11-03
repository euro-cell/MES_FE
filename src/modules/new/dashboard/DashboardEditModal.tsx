import React, { useState } from 'react';
import type { DashboardProject, DashboardFormState } from './types';
import { updateProduction } from './dashboardService';
import '../../../styles/dashboard/modal.css';

interface Props {
  projects: DashboardProject[];
  onClose: () => void;
  refreshProjects: () => Promise<void>;
}

export default function DashboardEditModal({ projects, onClose, refreshProjects }: Props) {
  const [selected, setSelected] = useState<DashboardProject | null>(null);
  const [form, setForm] = useState<DashboardFormState>({
    company: '',
    mode: '',
    year: new Date().getFullYear(),
    month: 1,
    round: 1,
    batteryType: '',
    capacity: '',
    targetQuantity: 0,
  });
  const [loading, setLoading] = useState(false);

  /** ✅ 리스트 클릭 → 폼 세팅 */
  const handleSelect = (project: DashboardProject) => {
    setSelected(project);
    setForm({
      company: project.company || '',
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

  /** ✅ 수정 완료 */
  const handleUpdate = async () => {
    if (!selected) return alert('수정할 프로젝트를 선택하세요.');
    setLoading(true);
    try {
      await updateProduction(selected.id, form);
      alert('✅ 수정 완료');
      await refreshProjects();
      onClose();
    } catch (err) {
      console.error(err);
      alert('수정 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay wide'>
      <div className='modal large'>
        <h3>프로젝트 수정</h3>
        <div className='edit-modal-layout'>
          {/* 🔹 왼쪽: 프로젝트 리스트 */}
          <div className='project-list-section'>
            <ul className='modal-list'>
              {projects.map(p => (
                <li key={p.id} onClick={() => handleSelect(p)} className={selected?.id === p.id ? 'active' : ''}>
                  {p.name}
                </li>
              ))}
            </ul>
          </div>

          {/* 🔹 오른쪽: 수정 폼 */}
          <div className='project-edit-form'>
            {selected ? (
              <div>
                <h4>{selected.name} 수정</h4>

                <div className='form-row'>
                  <label>회사 약어</label>
                  <input name='company' value={form.company} onChange={handleChange} />
                </div>

                <div className='form-row'>
                  <label>회사 유형</label>
                  <select name='mode' value={form.mode} onChange={handleChange}>
                    <option value=''>선택</option>
                    <option value='OME'>OME (E)</option>
                    <option value='ODM'>ODM (D)</option>
                  </select>
                </div>

                <div className='form-row'>
                  <label>생산년도</label>
                  <input type='number' name='year' value={form.year} onChange={handleChange} />
                </div>

                <div className='form-row'>
                  <label>생산월</label>
                  <select name='month' value={form.month} onChange={handleChange}>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}월
                      </option>
                    ))}
                  </select>
                </div>

                <div className='form-row'>
                  <label>회차</label>
                  <input type='number' name='round' value={form.round} onChange={handleChange} />
                </div>

                <div className='form-row'>
                  <label>전지 타입</label>
                  <input name='batteryType' value={form.batteryType} onChange={handleChange} />
                </div>

                <div className='form-row'>
                  <label>용량</label>
                  <input type='number' name='capacity' value={form.capacity} onChange={handleChange} />
                </div>

                <div className='form-row'>
                  <label>목표 수량</label>
                  <input type='number' name='targetQuantity' value={form.targetQuantity} onChange={handleChange} />
                </div>

                <div className='modal-actions'>
                  <button onClick={handleUpdate} disabled={loading}>
                    {loading ? '수정 중...' : '완료'}
                  </button>
                  <button className='cancel-btn' onClick={onClose}>
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              <p className='empty-msg'>수정할 프로젝트를 선택하세요.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
