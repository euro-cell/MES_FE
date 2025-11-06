import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../../../styles/production/spec/materialNew.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Material {
  id: number;
  category: string;
  type: string;
  name: string;
  company: string;
  unit: string;
}

interface Row {
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

export default function MaterialNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectName, productionId } = location.state || {};

  if (!projectName || !productionId) return <p style={{ color: 'red' }}>⚠️ 프로젝트 정보가 없습니다.</p>;

  const [categories, setCategories] = useState<string[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [rows, setRows] = useState<Row[]>([
    {
      id: 1,
      classification: 'Cathode',
      category: '',
      materialType: '',
      model: '',
      company: '',
      unit: '',
      quantity: '',
    },
    { id: 2, classification: 'Anode', category: '', materialType: '', model: '', company: '', unit: '', quantity: '' },
    {
      id: 3,
      classification: 'Assembly',
      category: '',
      materialType: '',
      model: '',
      company: '',
      unit: '',
      quantity: '',
    },
  ]);

  /** 분류 목록 조회 */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/material/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error('❌ 분류 목록 불러오기 실패:', err);
      }
    };
    fetchCategories();
  }, []);

  /** category 선택 시 해당 자재 목록 불러오기 */
  const handleCategoryChange = async (rowId: number, category: string) => {
    setRows(prev =>
      prev.map(row =>
        row.id === rowId ? { ...row, category, materialType: '', model: '', company: '', unit: '' } : row
      )
    );

    try {
      const res = await axios.get(`${API_BASE}/material?category=${encodeURIComponent(category)}`);
      setMaterials(res.data);
    } catch (err) {
      console.error('❌ 자재 목록 조회 실패:', err);
    }
  };

  /** Material(type) 선택 시 */
  const handleMaterialChange = (rowId: number, type: string) => {
    setRows(prev =>
      prev.map(row => (row.id === rowId ? { ...row, materialType: type, model: '', company: '', unit: '' } : row))
    );
  };

  /** Model(name) 선택 시 */
  const handleModelChange = (rowId: number, model: string) => {
    const target = materials.find(m => m.name === model);
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

  /** Company 선택 */
  const handleCompanyChange = (rowId: number, company: string) => {
    setRows(prev => prev.map(row => (row.id === rowId ? { ...row, company } : row)));
  };

  /** 소요량 입력 */
  const handleQuantityChange = (rowId: number, value: string) => {
    setRows(prev => prev.map(row => (row.id === rowId ? { ...row, quantity: value } : row)));
  };

  /** 행 추가 */
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
      // ✅ findLastIndex 대신 안전한 방식
      const indices = prev.map((r, i) => (r.classification === classification ? i : -1));
      const lastIndex = Math.max(...indices);
      const copy = [...prev];
      if (lastIndex >= 0) copy.splice(lastIndex + 1, 0, newRow);
      else copy.push(newRow);
      return copy;
    });
  };

  /** 행 삭제 */
  const handleRemoveRow = (rowId: number) => {
    setRows(prev => prev.filter(r => r.id !== rowId));
  };

  /** 저장 */
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

      await axios.post(`${API_BASE}/production/${productionId}/materials`, payload);
      alert('✅ 자재 소요량이 등록되었습니다.');
      navigate(-1);
    } catch (err: any) {
      console.error('❌ 자재 등록 실패:', err);
      if (err.response) {
        const { error, message, statusCode } = err.response.data;
        alert(`${error}(${statusCode}): ${message}`);
        return;
      }
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  /** Classification별 그룹화 */
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
            <th>소요량 / 추가</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(group => {
            return group.map((row, idx) => {
              const filteredMaterials = materials.filter(m => m.category === row.category);
              const filteredTypes = [...new Set(filteredMaterials.map(m => m.type))];

              const filteredModels = [
                ...new Map(filteredMaterials.filter(m => m.type === row.materialType).map(m => [m.name, m])).values(),
              ];

              const filteredCompanies = [
                ...new Set(
                  filteredMaterials.filter(m => m.type === row.materialType && m.name === row.model).map(m => m.company)
                ),
              ];

              return (
                <tr key={row.id}>
                  {/* ✅ Classification 병합 */}
                  {idx === 0 && (
                    <td rowSpan={group.length} className={styles.classificationCell}>
                      {row.classification}
                    </td>
                  )}

                  {/* 분류(category) */}
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

                  {/* Material */}
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

                  {/* Model */}
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

                  {/* Company */}
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

                  {/* 단위 */}
                  <td>{row.unit?.toUpperCase()}</td>

                  {/* 소요량 + 버튼 */}
                  <td>
                    <div className={styles.actionCell}>
                      <input
                        type='number'
                        value={row.quantity}
                        onChange={e => handleQuantityChange(row.id, e.target.value)}
                        step='0.1'
                        placeholder='0.0'
                      />
                      <button className={styles.addBtn} onClick={() => handleAddRow(row.classification)}>
                        ＋
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleRemoveRow(row.id)}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              );
            });
          })}
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
