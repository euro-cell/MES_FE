import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../../../styles/production/worklog/WorklogList.module.css';
import TooltipButton from '../../../../components/TooltipButton';
import { getWorklogs } from './WorklogService';
import type { WorklogEntry } from './WorklogTypes';
import { getBinderWorklogs, deleteBinderWorklog } from './processes/binder/BinderService';
import { getSlurryWorklogs, deleteSlurryWorklog } from './processes/slurry/SlurryService';

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
      let data: WorklogEntry[];

      if (processId === 'Binder') {
        const binderData = await getBinderWorklogs(projectId);
        data = binderData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Slurry') {
        const slurryData = await getSlurryWorklogs(projectId);
        data = slurryData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else {
        data = await getWorklogs(projectId, processId);
      }

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

  const handleDelete = async (worklogId: number) => {
    if (!confirm('작업일지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      if (processId === 'Binder') {
        await deleteBinderWorklog(projectId, worklogId);
      } else if (processId === 'Slurry') {
        await deleteSlurryWorklog(projectId, worklogId);
      } else {
        // 다른 공정은 범용 삭제 API 사용 (미구현)
        throw new Error('삭제 기능이 구현되지 않았습니다.');
      }

      alert('작업일지가 삭제되었습니다.');
      loadWorklogs(); // 목록 새로고침
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 실패: ' + err);
    }
  };

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
                    <TooltipButton label='삭제' variant='delete' onClick={() => handleDelete(log.id)} />
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
