import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createSpecification } from './SpecService';
import type { SpecForm } from './SpecTypes';
import { initialSpecForm } from './SpecInitialState';
import SpecSectionCathode from './SpecSectionCathode';
import SpecSectionAnode from './SpecSectionAnode';
import SpecSectionAssembly from './SpecSectionAssembly';
import SpecSectionCell from './SpecSectionCell';
import styles from '../../../../styles/production/spec/specNew.module.css';

export default function SpecNew() {
  const location = useLocation();
  const { projectName, productionId } = location.state || {};

  if (!projectName || !productionId) return <p style={{ color: 'red' }}>⚠️ 프로젝트 정보가 없습니다.</p>;

  const [form, setForm] = useState<SpecForm>(initialSpecForm);

  const handleChange = (section: string, field: string, index: number, key: string, value: string) => {
    setForm(prev => {
      const copy = structuredClone(prev);
      if (section === 'cell' && field === 'energyDensity') {
        const [targetKey, targetField] = key.split('.');
        (copy as any).cell.energyDensity[targetKey][targetField] = value;
        return copy;
      }
      if (Array.isArray((copy as any)[section][field])) {
        (copy as any)[section][field][index][key] = value;
        return copy;
      }
      (copy as any)[section][field][key] = value;
      return copy;
    });
  };

  const addRow = (section: string, field: string) => {
    setForm(prev => {
      const copy = structuredClone(prev);
      (copy as any)[section][field].push({ value: '', remark: '' });
      return copy;
    });
  };

  const removeRow = (section: string, field: string, index: number) => {
    setForm(prev => {
      const copy = structuredClone(prev);
      (copy as any)[section][field].splice(index, 1);
      return copy;
    });
  };

  const handleSubmit = async () => {
    try {
      await createSpecification(productionId, form);
      alert('✅ 설계 정보가 저장되었습니다.');
    } catch (err: any) {
      console.error('❌ 설계 저장 실패:', err);
      if (err.response) {
        const { error, message, statusCode } = err.response.data;
        alert(`${error}(${statusCode}): ${message}`);
        return;
      }
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.specNew}>
      <h2>{projectName} 전지 설계 등록</h2>
      <table className={styles.specNewTable}>
        <thead>
          <tr>
            <th colSpan={3}>Classification</th>
            <th>Value</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          <SpecSectionCathode
            form={form}
            handleChange={handleChange}
            addRow={addRow}
            removeRow={removeRow}
            styles={styles}
          />
          <SpecSectionAnode
            form={form}
            handleChange={handleChange}
            addRow={addRow}
            removeRow={removeRow}
            styles={styles}
          />
          <SpecSectionAssembly form={form} handleChange={handleChange} styles={styles} />
          <SpecSectionCell form={form} handleChange={handleChange} styles={styles} />
        </tbody>
      </table>

      <div className={styles.saveWrap}>
        <button className={styles.saveBtn} onClick={handleSubmit}>
          저장
        </button>
      </div>
    </div>
  );
}
