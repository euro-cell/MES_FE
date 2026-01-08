import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProjectTable from './ProjectTable';
import { fetchCellInventoryByProject, type CellInventoryDetail } from './ProjectService';

export default function ProjectDetail() {
  const { projectName } = useParams<{ projectName: string }>();
  const [data, setData] = useState<CellInventoryDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectName) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchCellInventoryByProject(projectName);
        setData(result);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectName]);

  if (loading) {
    return <div style={{ padding: '20px' }}>데이터를 불러오는 중...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>{projectName} 상세 현황</h3>
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
      <ProjectTable data={data} />
    </div>
  );
}
