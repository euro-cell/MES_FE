import { useEffect, useState } from 'react';
import { getAllProductions } from './productionService';
import type { Project } from './types';
import ProductionForm from './ProductionForm';
import ProductionView from './ProductionView';

export default function ProductionList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewProjectId, setViewProjectId] = useState<number | null>(null);

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

  if (viewProjectId) {
    return (
      <div className='production-temp-page'>
        <button className='btn btn-secondary' onClick={() => setViewProjectId(null)}>
          ← 목록으로
        </button>
        <ProductionView productionId={viewProjectId} />
      </div>
    );
  }

  return (
    <div className='production-temp-page'>
      <table className='production-temp-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>프로젝트명</th>
            <th>회사</th>
            <th>유형</th>
            <th>년도</th>
            <th>월</th>
            <th>회차</th>
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
                <td>{p.round}</td>
                <td>{p.batteryType}</td>
                <td>{p.capacity}</td>
                <td>
                  <button className='btn btn-info' onClick={() => setViewProjectId(p.id)}>
                    조회
                  </button>
                  <button className='btn btn-primary' onClick={() => setSelectedProject(p)}>
                    등록
                  </button>
                  {/* <button className='btn btn-secondary'>수정</button> */}
                  <button className='btn btn-danger'>삭제</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10}>데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedProject && (
        <div className='production-form-container'>
          <h3 style={{ marginTop: '20px', color: '#1b263b' }}>프로젝트 {selectedProject.name} 일정 등록</h3>
          <ProductionForm projectId={selectedProject.id} onClose={() => setSelectedProject(null)} />
        </div>
      )}
    </div>
  );
}
