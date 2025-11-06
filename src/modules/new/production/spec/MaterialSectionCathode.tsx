import axios from 'axios';
import { useState } from 'react';
import type { MaterialRow } from './MaterialTypes';
import styles from '../../../../styles/production/spec/materialNew.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Props {
  rows: MaterialRow[];
  setRows: (rows: MaterialRow[]) => void;
  categories: string[];
}

export default function MaterialSectionCathode({ rows, setRows, categories }: Props) {
  const [materials, setMaterials] = useState<any[]>([]);

  const handleCategoryChange = async (idx: number, category: string) => {
    const updated = rows.map((r, i) =>
      i === idx ? { ...r, category, materialType: '', model: '', company: '', unit: '' } : r
    );
    setRows(updated);
    try {
      const res = await axios.get(`${API_BASE}/material?category=${encodeURIComponent(category)}`);
      setMaterials(res.data);
    } catch (err) {
      console.error('❌ 자재 목록 조회 실패:', err);
    }
  };

  const handleChange = (idx: number, field: keyof MaterialRow, value: string) => {
    const updated = rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
    setRows(updated);
  };

  const addRow = () =>
    setRows([...rows, { category: '', materialType: '', model: '', company: '', unit: '', quantity: '' }]);

  const removeRow = (idx: number) => setRows(rows.filter((_, i) => i !== idx));

  return (
    <div className={styles.section}>
      <h3>Cathode</h3>
      <table className={styles.materialNewTable}>
        <thead>
          <tr>
            <th>분류</th>
            <th>Material</th>
            <th>Model</th>
            <th>Company</th>
            <th>단위</th>
            <th>소요량</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const filtered = materials.filter(m => m.category === row.category);
            const filteredTypes = [...new Set(filtered.map(m => m.type))];
            const filteredModels = [
              ...new Map(filtered.filter(m => m.type === row.materialType).map(m => [m.name, m])).values(),
            ];
            const filteredCompanies = [
              ...new Set(filtered.filter(m => m.type === row.materialType && m.name === row.model).map(m => m.company)),
            ];

            return (
              <tr key={idx}>
                <td>
                  <select value={row.category} onChange={e => handleCategoryChange(idx, e.target.value)}>
                    <option value=''>선택</option>
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select value={row.materialType} onChange={e => handleChange(idx, 'materialType', e.target.value)}>
                    <option value=''>선택</option>
                    {filteredTypes.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select value={row.model} onChange={e => handleChange(idx, 'model', e.target.value)}>
                    <option value=''>선택</option>
                    {filteredModels.map(m => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select value={row.company} onChange={e => handleChange(idx, 'company', e.target.value)}>
                    <option value=''>선택</option>
                    {filteredCompanies.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{row.unit?.toUpperCase()}</td>
                <td>
                  <div className={styles.actionCell}>
                    <input
                      type='number'
                      value={row.quantity}
                      onChange={e => handleChange(idx, 'quantity', e.target.value)}
                      step='0.1'
                      placeholder='0.0'
                    />
                    {idx < 5 ? (
                      <button className={styles.addBtn} onClick={addRow}>
                        ＋
                      </button>
                    ) : (
                      <button className={styles.deleteBtn} onClick={() => removeRow(idx)}>
                        🗑
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
