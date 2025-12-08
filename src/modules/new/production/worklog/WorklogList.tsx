import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../../../styles/production/worklog/WorklogList.module.css';
import TooltipButton from '../../../../components/TooltipButton';
import { getWorklogs } from './WorklogService';
import type { WorklogEntry } from './WorklogTypes';

interface WorklogListProps {
  projectId: number;
  processId: string;
  processTitle: string;
}

export default function WorklogList({ projectId, processId, processTitle }: WorklogListProps) {
  const navigate = useNavigate();
  const [worklogs, setWorklogs] = useState<WorklogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorklogs = async () => {
    setLoading(true);
    try {
      const data = await getWorklogs(projectId, processId);
      setWorklogs(data);
    } catch (err) {
      console.error('작업일지 조회 실패:', err);
      // 목 데이터 사용
      setWorklogs(getMockWorklogs(projectId, processId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorklogs();
  }, [projectId, processId]);

  if (loading) return <p>작업일지를 불러오는 중...</p>;

  return (
    <div className={styles.worklogList}>
      <div className={styles.header}>
        <h3>{processTitle} 작업일지</h3>
        <TooltipButton
          label='등록'
          variant='register'
          onClick={() => navigate(`/prod/log/${projectId}/${processId.toLowerCase()}/register`)}
        />
      </div>

      <table className={styles.worklogTable}>
        <thead>
          <tr>
            <th>작업일</th>
            <th>회차</th>
            <th>작성자</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {worklogs.length === 0 ? (
            <tr>
              <td colSpan={7}>등록된 작업일지가 없습니다.</td>
            </tr>
          ) : (
            worklogs.map(log => (
              <tr key={log.id}>
                <td>{log.workDate}</td>
                <td>{log.round}</td>
                <td>{log.createdBy}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <TooltipButton
                      label='조회'
                      variant='view'
                      onClick={() => navigate(`/prod/log/${projectId}/${processId.toLowerCase()}/view/${log.id}`)}
                    />
                    <TooltipButton
                      label='수정'
                      variant='edit'
                      onClick={() => navigate(`/prod/log/${projectId}/${processId.toLowerCase()}/edit/${log.id}`)}
                    />
                    <TooltipButton label='삭제' variant='delete' onClick={() => console.log('삭제:', log.id)} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// 목 데이터 (백엔드 미구현 시)
function getMockWorklogs(projectId: number, processId: string): WorklogEntry[] {
  return [
    {
      id: 1,
      projectId,
      processId,
      workDate: '2025-12-01',
      round: 1,
      createdBy: '홍길동',
      createdAt: '2025-12-01T08:00:00Z',
      updatedAt: '2025-12-01T17:00:00Z',
    },
    {
      id: 2,
      projectId,
      processId,
      workDate: '2025-12-02',
      round: 2,
      createdBy: '김철수',
      createdAt: '2025-12-02T20:00:00Z',
      updatedAt: '2025-12-03T05:00:00Z',
    },
    {
      id: 3,
      projectId,
      processId,
      workDate: '2025-12-03',
      round: 3,
      createdBy: '박민수',
      createdAt: '2025-12-03T08:00:00Z',
      updatedAt: '2025-12-03T17:00:00Z',
    },
  ];
}
