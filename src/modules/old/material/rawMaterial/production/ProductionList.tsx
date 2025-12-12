import { useEffect, useState } from 'react';
import { ProductionService } from './ProductionService';
import ProductionMaterialForm from './ProductionMaterialForm';
import '../../../../../styles/material/rawMaterial.css';

interface Production {
  id: number;
  name: string;
  batteryType: string;
  hasMaterials?: boolean;
}

export default function ProductionList() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductionId, setSelectedProductionId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProductions = async () => {
    try {
      setLoading(true);
      const data = await ProductionService.getProductions();
      setProductions(data);
    } catch (err) {
      console.error('❌ 프로덕트 리스트 조회 실패:', err);
      setError('프로덕트 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getCellType = (batteryType: string): string => {
    if (!batteryType || batteryType.length < 3) return '-';
    const code = batteryType[2].toLowerCase();
    if (code === 'p') return '파우치형';
    if (code === 'c') return '각형';
    if (code === 'r') return '원통형';
    return '-';
  };

  const handleRegisterClick = (id: number) => {
    setSelectedProductionId(id);
    setShowForm(true);
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  if (loading) return <p>⏳ 로딩 중...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className='production-list'>
      <h3>📋 프로젝트 리스트</h3>

      {productions.length === 0 ? (
        <p>등록된 프로젝트가 없습니다.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>프로젝트명</th>
              <th>전지 타입</th>
              <th>종류</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {productions.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.batteryType}</td>
                <td>{getCellType(p.batteryType)}</td>
                <td className='manage-buttons'>
                  <button className='view-btn' disabled={!p.hasMaterials} onClick={() => alert(`조회: ${p.name}`)}>
                    조회
                  </button>
                  <button className='register-btn' onClick={() => handleRegisterClick(p.id)}>
                    등록
                  </button>
                  <button className='delete-btn' disabled={!p.hasMaterials} onClick={() => alert(`삭제: ${p.name}`)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && selectedProductionId && (
        <ProductionMaterialForm
          productionId={selectedProductionId}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchProductions();
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
