import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DashboardFormState, DashboardProject } from './types';
import DashboardEditModal from './DashboardEditModal';
import DashboardDeleteModal from './DashboardDeleteModal';
import styles from '../../styles/dashboard/manager.module.css';
import { getErrorMessage } from '../../api/errorHandler';
import { getCustomers } from '../../api/etc/customerService';
import type { Customer } from '../../api/etc/customerService';
import CustomerModal from '../etc/customer/CustomerModal';

interface Props {
  form: DashboardFormState;
  setForm: React.Dispatch<React.SetStateAction<DashboardFormState>>;
  onSubmit: (data: DashboardFormState) => Promise<void>;
  refreshProjects: () => Promise<void>;
  projects: DashboardProject[];
}

type FormErrors = Partial<Record<keyof DashboardFormState, string>>;

export default function DashboardProjectManager({ form, setForm, onSubmit, refreshProjects, projects }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false);
  const navigate = useNavigate();

  const fetchCustomers = () => getCustomers().then(setCustomers).catch(() => {});

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof DashboardFormState]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const shortName = e.target.value;
    const customer = customers.find(c => c.shortName === shortName);
    setForm(prev => ({ ...prev, company: shortName, customerId: customer?.id ?? null }));
    if (errors.company) {
      setErrors(prev => ({ ...prev, company: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.company) errs.company = '고객사를 선택해주세요.';
    if (!form.mode) errs.mode = '회사 유형을 선택해주세요.';
    if (!form.batteryType.trim()) errs.batteryType = '전지 타입을 입력해주세요.';
    if (!form.capacity || Number(form.capacity) <= 0) errs.capacity = '용량을 입력해주세요.';
    if (!form.targetQuantity || form.targetQuantity <= 0) errs.targetQuantity = '목표 수량을 입력해주세요.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await onSubmit(form);
      alert('프로젝트 등록 완료');
      await refreshProjects();
      setErrors({});
      setForm({
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
    } catch (err: any) {
      console.error('등록 실패:', err);
      alert(getErrorMessage(err, '등록 중 오류가 발생했습니다.'));
    }
  };

  return (
    <div className={styles.dashboardProjectManager}>
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

      <form onSubmit={handleSubmit} className={styles.managerForm}>
        <div className={styles.formRow}>
          <label onClick={() => setShowNavigateConfirm(true)} className={styles.labelLink}>고객사</label>
          <div className={styles.fieldWrap}>
            <div className={styles.selectWithBtn}>
              <select
                name='company'
                value={form.company}
                onChange={handleCustomerChange}
                className={errors.company ? styles.inputError : ''}
              >
                <option value=''>선택</option>
                {customers.map(c => (
                  <option key={c.id} value={c.shortName}>
                    {c.name}({c.shortName})
                  </option>
                ))}
              </select>
              <button type='button' className={styles.addCustomerBtn} onClick={() => setShowCustomerModal(true)}>
                + 추가
              </button>
            </div>
            {errors.company && <span className={styles.errorMsg}>{errors.company}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <label>회사 유형</label>
          <div className={styles.fieldWrap}>
            <select
              name='mode'
              value={form.mode}
              onChange={handleChange}
              className={errors.mode ? styles.inputError : ''}
            >
              <option value=''>선택</option>
              <option value='OEM'>OEM (E)</option>
              <option value='ODM'>ODM (D)</option>
            </select>
            {errors.mode && <span className={styles.errorMsg}>{errors.mode}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <label>생산년도</label>
          <div className={styles.fieldWrap}>
            <input type='number' name='year' value={form.year} onChange={handleChange} />
          </div>
        </div>

        <div className={styles.formRow}>
          <label>생산월</label>
          <div className={styles.fieldWrap}>
            <select name='month' value={form.month} onChange={handleChange}>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}월
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <label>회차</label>
          <div className={styles.fieldWrap}>
            <input type='number' name='round' value={form.round} onChange={handleChange} />
          </div>
        </div>

        <div className={styles.formRow}>
          <label>전지 타입</label>
          <div className={styles.fieldWrap}>
            <input
              type='text'
              name='batteryType'
              value={form.batteryType}
              onChange={handleChange}
              placeholder='예: TNP'
              className={errors.batteryType ? styles.inputError : ''}
            />
            {errors.batteryType && <span className={styles.errorMsg}>{errors.batteryType}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <label>용량</label>
          <div className={styles.fieldWrap}>
            <input
              type='number'
              name='capacity'
              value={form.capacity}
              onChange={handleChange}
              placeholder='예: 38'
              className={errors.capacity ? styles.inputError : ''}
            />
            {errors.capacity && <span className={styles.errorMsg}>{errors.capacity}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <label>목표 수량</label>
          <div className={styles.fieldWrap}>
            <input
              type='number'
              name='targetQuantity'
              value={form.targetQuantity}
              onChange={handleChange}
              placeholder='예: 1000'
              className={errors.targetQuantity ? styles.inputError : ''}
            />
            {errors.targetQuantity && <span className={styles.errorMsg}>{errors.targetQuantity}</span>}
          </div>
        </div>

        <button type='submit' className={styles.managerBtn}>
          등록하기
        </button>
      </form>

      {showNavigateConfirm && (
        <div className={styles.confirmBackdrop}>
          <div className={styles.confirmModal}>
            <p>고객 코드 관리 대장 페이지로 이동하시겠습니까?</p>
            <div className={styles.confirmFooter}>
              <button className={styles.confirmCancelBtn} onClick={() => setShowNavigateConfirm(false)}>취소</button>
              <button className={styles.confirmOkBtn} onClick={() => { setShowNavigateConfirm(false); navigate('/etc/customer'); }}>이동</button>
            </div>
          </div>
        </div>
      )}

      {showCustomerModal && (
        <CustomerModal
          onClose={() => setShowCustomerModal(false)}
          onSave={() => {
            setShowCustomerModal(false);
            fetchCustomers();
          }}
        />
      )}

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
