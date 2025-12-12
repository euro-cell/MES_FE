import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../../../../styles/production/spec/materialNew.module.css';
import {
  getMaterialCategories,
  getMaterialsByCategory,
  getMaterialsByProduction,
  updateProductionMaterial,
} from './MaterialService';

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

export default function MaterialEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectName, productionId } = location.state || {};

  if (!projectName || !productionId) return <p style={{ color: 'red' }}>⚠️ 프로젝트 정보가 없습니다.</p>;

  const [categories, setCategories] = useState<string[]>([]);
  const [materialsMap, setMaterialsMap] = useState<Record<number, Material[]>>({});
  const [rows, setRows] = useState<Row[]>([]);

  // ✅ 분류 목록 로드
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

  // ✅ 기존 소요량 조회 및 폼 초기화
  useEffect(() => {
    const fetchExistingMaterials = async () => {
      try {
        const res = await getMaterialsByProduction(productionId);
        const grouped = res.materials || {};

        const loadedRows: Row[] = [];
        let idCount = 1;

        Object.entries(grouped).forEach(([classification, items]) => {
          (items as any[]).forEach(item => {
            loadedRows.push({
              id: idCount++,
              classification: classification as Row['classification'],
              category: item.category,
              materialType: item.material,
              model: item.model,
              company: item.company,
              unit: item.unit,
              quantity: item.requiredAmount.toString(),
            });
          });
        });

        setRows(loadedRows);

        // 각 카테고리별 자재 목록 미리 로드
        for (const r of loadedRows) {
          const data = await getMaterialsByCategory(r.category);
          setMaterialsMap(prev => ({ ...prev, [r.id]: data }));
        }
      } catch (err) {
        console.error('❌ 기존 자재 소요량 불러오기 실패:', err);
      }
    };

    if (productionId && categories.length > 0) fetchExistingMaterials();
  }, [productionId, categories]);

  // ✅ 선택 핸들러들
  const handleCategoryChange = async (rowId: number, category: string) => {
    setRows(prev =>
      prev.map(r => (r.id === rowId ? { ...r, category, materialType: '', model: '', company: '', unit: '' } : r))
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
      prev.map(r => (r.id === rowId ? { ...r, materialType: type, model: '', company: '', unit: '' } : r))
    );
  };

  const handleModelChange = (rowId: number, model: string) => {
    const rowMaterials = materialsMap[rowId] || [];
    const target = rowMaterials.find(m => m.name === model);
    setRows(prev =>
      prev.map(r =>
        r.id === rowId
          ? {
              ...r,
              model,
              company: target?.company || '',
              unit: target?.unit || '',
              materialId: target?.id,
            }
          : r
      )
    );
  };

  const handleQuantityChange = (rowId: number, value: string) => {
    setRows(prev => prev.map(r => (r.id === rowId ? { ...r, quantity: value } : r)));
  };

  // ✅ 수정 저장
  const handleSave = async () => {
    try {
      const payload = {
        materials: rows.map(r => ({
          classification: r.classification,
          category: r.category,
          type: r.materialType,
          name: r.model,
          company: r.company,
          unit: r.unit,
          quantity: parseFloat(r.quantity),
        })),
      };

      await updateProductionMaterial(productionId, payload.materials);
      alert('✅ 자재 소요량이 수정되었습니다.');
      navigate(-1);
    } catch (err) {
      console.error('❌ 자재 수정 실패:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  // ✅ 렌더링
  const grouped = ['Cathode', 'Anode', 'Assembly'].map(c => rows.filter(r => r.classification === c));

  return (
    <div className={styles.materialNewContainer}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← 목록으로
      </button>

      <h2 className={styles.materialNewTitle}>{projectName} 자재 소요량 수정</h2>

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
                    <select value={row.company} disabled>
                      <option>{row.company}</option>
                    </select>
                  </td>
                  <td>{row.unit?.toUpperCase()}</td>
                  <td>
                    <input
                      type='number'
                      value={row.quantity}
                      onChange={e => handleQuantityChange(row.id, e.target.value)}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className={styles.saveWrap}>
        <button className={styles.saveBtn} onClick={handleSave}>
          수정 저장
        </button>
      </div>
    </div>
  );
}
