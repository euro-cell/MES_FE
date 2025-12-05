import { useEffect, useState } from 'react';
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
        <TooltipButton label='등록' variant='register' onClick={() => console.log('등록')} />
      </div>

      <table className={styles.worklogTable}>
        <thead>
          <tr>
            <th>작업일</th>
            <th>회차</th>
            <th>수량</th>
            <th>수율(%)</th>
            <th>작성자</th>
            <th>수정자</th>
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
                <td>{log.quantity}</td>
                <td>{log.yield}%</td>
                <td>{log.createdBy}</td>
                <td>{log.updatedBy}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <TooltipButton label='조회' variant='view' onClick={() => console.log('조회:', log.id)} />
                    <TooltipButton label='수정' variant='edit' onClick={() => console.log('수정:', log.id)} />
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
      quantity: 1000,
      yield: 98.5,
      createdBy: '홍길동',
      updatedBy: '홍길동',
      createdAt: '2025-12-01T08:00:00Z',
      updatedAt: '2025-12-01T17:00:00Z',
    },
    {
      id: 2,
      projectId,
      processId,
      workDate: '2025-12-02',
      round: 2,
      quantity: 950,
      yield: 97.2,
      createdBy: '김철수',
      updatedBy: '이영희',
      createdAt: '2025-12-02T20:00:00Z',
      updatedAt: '2025-12-03T05:00:00Z',
    },
    {
      id: 3,
      projectId,
      processId,
      workDate: '2025-12-03',
      round: 3,
      quantity: 1050,
      yield: 99.1,
      createdBy: '박민수',
      updatedBy: '박민수',
      createdAt: '2025-12-03T08:00:00Z',
      updatedAt: '2025-12-03T17:00:00Z',
    },
  ];
}