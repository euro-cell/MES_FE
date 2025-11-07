import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../../../../../styles/production/spec/materialNew.module.css';
import { initialIds, initialRows } from './MaterialInitialRows';
import { getMaterialCategories, getMaterialsByCategory, postMaterialRequirements } from './MaterialService';

export interface Row {
  id: number;
  classification: 'Cathode' | 'Anode' | 'Assembly';
  category: string;
  materialType: string;
  model: string;
  company: string;
  unit: string;
  quantity: string;
  materialId?: number;
}

interface Material {
  id: number;
  category: string;
  type: string;
  name: string;
  company: string;
  unit: string;
}

export default function MaterialNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectName, productionId } = location.state || {};

  if (!projectName || !productionId) return <p style={{ color: 'red' }}>⚠️ 프로젝트 정보가 없습니다.</p>;

  const [categories, setCategories] = useState<string[]>([]);
  const [materialsMap, setMaterialsMap] = useState<Record<number, Material[]>>({});
  const [rows, setRows] = useState<Row[]>(initialRows);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getMaterialCategories();
        setCategories(data);
      } catch (err) {
        console.error('❌ 분류 목록 불러오기 실패:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const initCategoryMaterials = async () => {
      for (const row of rows) {
        if (row.category) {
          try {
            const data = await getMaterialsByCategory(row.category);
            setMaterialsMap(prev => ({ ...prev, [row.id]: data }));
          } catch (err) {
            console.error(`❌ 초기 자재 목록 로드 실패 (${row.category}):`, err);
          }
        }
      }
    };
    if (categories.length > 0) initCategoryMaterials();
  }, [categories]);

  const handleCategoryChange = async (rowId: number, category: string) => {
    setRows(prev =>
      prev.map(row =>
        row.id === rowId ? { ...row, category, materialType: '', model: '', company: '', unit: '' } : row
      )
    );

    try {
      const data = await getMaterialsByCategory(category);
      setMaterialsMap(prev => ({ ...prev, [rowId]: data }));
    } catch (err) {
      console.error('❌ 자재 목록 조회 실패:', err);
    }
  };

  const handleMaterialChange = (rowId: number, type: string) => {
    setRows(prev =>
      prev.map(row => (row.id === rowId ? { ...row, materialType: type, model: '', company: '', unit: '' } : row))
    );
  };

  const handleModelChange = (rowId: number, model: string) => {
    const rowMaterials = materialsMap[rowId] || [];
    const target = rowMaterials.find(m => m.name === model);
    setRows(prev =>
      prev.map(row =>
        row.id === rowId
          ? {
              ...row,
              model,
              company: target?.company || '',
              unit: target?.unit || '',
              materialId: target?.id,
            }
          : row
      )
    );
  };

  const handleCompanyChange = (rowId: number, company: string) => {
    setRows(prev => prev.map(row => (row.id === rowId ? { ...row, company } : row)));
  };

  const handleQuantityChange = (rowId: number, value: string) => {
    setRows(prev => prev.map(row => (row.id === rowId ? { ...row, quantity: value } : row)));
  };

  const handleAddRow = (classification: Row['classification']) => {
    const newRow: Row = {
      id: Date.now(),
      classification,
      category: '',
      materialType: '',
      model: '',
      company: '',
      unit: '',
      quantity: '',
    };
    setRows(prev => {
      const indices = prev.map((r, i) => (r.classification === classification ? i : -1));
      const lastIndex = Math.max(...indices);
      const copy = [...prev];
      if (lastIndex >= 0) copy.splice(lastIndex + 1, 0, newRow);
      else copy.push(newRow);
      return copy;
    });
  };

  const handleRemoveRow = (rowId: number) => {
    setRows(prev => prev.filter(r => r.id !== rowId));
    setMaterialsMap(prev => {
      const copy = { ...prev };
      delete copy[rowId];
      return copy;
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        materials: rows.map(r => ({
          classification: r.classification,
          materialId: r.materialId,
          category: r.category,
          type: r.materialType,
          name: r.model,
          company: r.company,
          unit: r.unit,
          quantity: parseFloat(r.quantity),
        })),
      };
      await postMaterialRequirements(productionId, payload);
      alert('✅ 자재 소요량이 등록되었습니다.');
      navigate(-1);
    } catch (err: any) {
      console.error('❌ 자재 등록 실패:', err);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  const grouped = ['Cathode', 'Anode', 'Assembly'].map(c => rows.filter(r => r.classification === c));

  return (
    <div className={styles.materialNewContainer}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← 목록으로
      </button>

      <h2 className={styles.materialNewTitle}>{projectName} 자재 소요량 등록</h2>

      <table className={styles.materialNewTable}>
        <thead>
          <tr>
            <th>Classification</th>
            <th>분류</th>
            <th>Material</th>
            <th>Model</th>
            <th>Company</th>
            <th>단위</th>
            <th>소요량</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(group =>
            group.map((row, idx) => {
              const rowMaterials = materialsMap[row.id] || [];
              const filteredTypes = [...new Set(rowMaterials.map(m => m.type))];
              const filteredModels = [
                ...new Map(rowMaterials.filter(m => m.type === row.materialType).map(m => [m.name, m])).values(),
              ];
              const filteredCompanies = [
                ...new Set(
                  rowMaterials.filter(m => m.type === row.materialType && m.name === row.model).map(m => m.company)
                ),
              ];

              return (
                <tr key={row.id}>
                  {idx === 0 && (
                    <td rowSpan={group.length} className={styles.classificationCell}>
                      {row.classification}
                    </td>
                  )}
                  <td>
                    <select value={row.category} onChange={e => handleCategoryChange(row.id, e.target.value)}>
                      <option value=''>선택</option>
                      {categories.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select value={row.materialType} onChange={e => handleMaterialChange(row.id, e.target.value)}>
                      <option value=''>선택</option>
                      {filteredTypes.map(t => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select value={row.model} onChange={e => handleModelChange(row.id, e.target.value)}>
                      <option value=''>선택</option>
                      {filteredModels.map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select value={row.company} onChange={e => handleCompanyChange(row.id, e.target.value)}>
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
                        onChange={e => handleQuantityChange(row.id, e.target.value)}
                        step='0.1'
                        placeholder='0.0'
                      />
                      {initialIds.includes(row.id) ? (
                        <button className={styles.addBtn} onClick={() => handleAddRow(row.classification)}>
                          ＋
                        </button>
                      ) : (
                        <button className={styles.deleteBtn} onClick={() => handleRemoveRow(row.id)}>
                          -
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
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
