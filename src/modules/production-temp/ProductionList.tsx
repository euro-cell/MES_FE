import React, { useEffect, useState } from 'react';
import { getAllProductions } from './productionService';
import type { Project } from './types';
import ProductionForm from './ProductionForm';

export default function ProductionList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllProductions();
      setProjects(data);
    } catch (err) {
      console.error('생산계획 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <table className='production-temp-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>프로젝트명</th>
            <th>회사</th>
            <th>유형</th>
            <th>년도</th>
            <th>월</th>
            <th>전지 타입</th>
            <th>용량</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.company}</td>
                <td>{p.mode}</td>
                <td>{p.year}</td>
                <td>{p.month}</td>
                <td>{p.batteryType}</td>
                <td>{p.capacity}</td>
                <td>
                  <button onClick={() => setSelectedProjectId(p.id)}>등록</button>
                  <button>수정</button>
                  <button>삭제</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9}>데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ 등록버튼 클릭 시 폼 표시 */}
      {selectedProjectId && (
        <div>
          <h3 style={{ marginTop: '20px', color: '#1b263b' }}>프로젝트 #{selectedProjectId} 일정 등록</h3>
          <ProductionForm projectId={selectedProjectId} />
        </div>
      )}
    </div>
  );
}
