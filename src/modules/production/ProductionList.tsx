const API_BASE = import.meta.env.VITE_API_BASE_URL;

import React, { useEffect, useState } from 'react';
import ProductionTable from './ProductionTable';
import ProductionRegister from './ProductionRegister';
import ProductionView from './ProductionView';
import '../../styles/production.css'; // ✅ 파일명 변경

interface Production {
  id: number;
  name: string;
  company: string;
  mode: string;
  year: number;
  month: number;
  round: number;
  batteryType: string;
  capacity: number;
}

export default function ProductionList() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // ✅ 생산계획 목록 로드
  useEffect(() => {
    fetch(`${API_BASE}/production`) // ✅ 엔드포인트 수정 (백엔드에 맞게)
      .then(res => res.json())
      .then(setProductions)
      .catch(() => setProductions([]))
      .finally(() => setLoading(false));
  }, []);

  // ✅ 삭제 기능
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`${name} 생산계획을 삭제하시겠습니까?`)) return;
    await fetch(`${API_BASE}/production/${id}`, { method: 'DELETE' });
    setProductions(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className='production-page'>
      <h2>생산계획 관리</h2>

      {loading ? (
        <p>📡 로딩 중...</p>
      ) : (
        <ProductionTable
          productions={productions}
          onRegister={production => {
            setSelectedProduction(production);
            setShowPlanModal(true);
          }}
          onView={production => {
            setSelectedProduction(production);
            setShowViewModal(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {showPlanModal && selectedProduction && (
        <ProductionRegister production={selectedProduction} onClose={() => setShowPlanModal(false)} />
      )}

      {showViewModal && selectedProduction && (
        <ProductionView production={selectedProduction} onClose={() => setShowViewModal(false)} />
      )}
    </div>
  );
}
