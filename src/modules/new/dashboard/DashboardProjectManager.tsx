import React from 'react';
import type { DashboardFormState } from './types';
import '../../../styles/dashboard/manager.css';

interface Props {
  form: DashboardFormState;
  setForm: React.Dispatch<React.SetStateAction<DashboardFormState>>;
  onSubmit: (data: DashboardFormState) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

export default function DashboardProjectManager({ form, setForm, onSubmit, refreshProjects }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: DashboardFormState) => ({ ...prev, [name]: value }));
  };

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
    <div className='dashboard-project-manager box'>
      <h3>프로젝트 관리</h3>
      <form onSubmit={handleSubmit} className='manager-form'>
        <div className='form-row'>
          <label>회사 약어</label>
          <input type='text' name='company' value={form.company} onChange={handleChange} placeholder='예: NA' />
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
          <input
            type='text'
            name='batteryType'
            value={form.batteryType}
            onChange={handleChange}
            placeholder='예: TNP'
          />
        </div>

        <div className='form-row'>
          <label>용량</label>
          <input type='number' name='capacity' value={form.capacity} onChange={handleChange} placeholder='예: 38' />
        </div>

        <div className='form-row'>
          <label>목표 수량</label>
          <input
            type='number'
            name='targetQuantity'
            value={form.targetQuantity}
            onChange={handleChange}
            placeholder='예: 1000'
          />
        </div>

        <button type='submit' className='manager-btn'>
          등록하기
        </button>
      </form>
    </div>
  );
}
