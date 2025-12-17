import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/production/worklog/WorklogList.module.css';
import TooltipButton from '../../../components/TooltipButton';
import { getWorklogs } from './WorklogService';
import type { WorklogEntry } from './WorklogTypes';
import { getBinderWorklogs, deleteBinderWorklog } from './processes/01-binder/BinderService';
import { getSlurryWorklogs, deleteSlurryWorklog } from './processes/02-slurry/SlurryService';
import { getCoatingWorklogs, deleteCoatingWorklog } from './processes/03-coating/CoatingService';
import { getPressWorklogs, deletePressWorklog } from './processes/04-press/PressService';
import { getNotchingWorklogs, deleteNotchingWorklog } from './processes/06-notching/NotchingService';
import { getVdWorklogs, deleteVdWorklog } from './processes/07-vd/VdService';
import { getFormingWorklogs, deleteFormingWorklog } from './processes/08-forming/FormingService';
import { getStackingWorklogs, deleteStackingWorklog } from './processes/09-stacking/StackingService';
import { getWeldingWorklogs, deleteWeldingWorklog } from './processes/10-welding/WeldingService';
import { getSealingWorklogs, deleteSealingWorklog } from './processes/11-sealing/SealingService';
import { getFillingWorklogs, deleteFillingWorklog } from './processes/12-filling/FillingService';
import { getFormationWorklogs, deleteFormationWorklog } from './processes/13-formation/FormationService';
import { getGradingWorklogs, deleteGradingWorklog } from './processes/14-grading/GradingService';
import { getInspectionWorklogs, deleteInspectionWorklog } from './processes/15-inspection/InspectionService';

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
      } else if (processId === 'Coating') {
        const coatingData = await getCoatingWorklogs(projectId);
        data = coatingData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Press') {
        const pressData = await getPressWorklogs(projectId);
        data = pressData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Notching') {
        const notchingData = await getNotchingWorklogs(projectId);
        data = notchingData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'VD') {
        const vdData = await getVdWorklogs(projectId);
        data = vdData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Forming') {
        const formingData = await getFormingWorklogs(projectId);
        data = formingData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Stacking') {
        const stackData = await getStackingWorklogs(projectId);
        data = stackData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Welding') {
        const weldingData = await getWeldingWorklogs(projectId);
        data = weldingData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Sealing') {
        const sealingData = await getSealingWorklogs(projectId);
        data = sealingData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Filling') {
        const fillingData = await getFillingWorklogs(projectId);
        data = fillingData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Formation') {
        const formationData = await getFormationWorklogs(projectId);
        data = formationData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Grading') {
        const gradingData = await getGradingWorklogs(projectId);
        data = gradingData.map(worklog => ({
          id: worklog.id,
          projectId: worklog.projectId,
          processId: worklog.processId,
          workDate: worklog.workDate,
          round: worklog.round,
          createdBy: worklog.writer,
          createdAt: worklog.createdAt,
          updatedAt: worklog.updatedAt,
        }));
      } else if (processId === 'Inspection') {
        const inspectionData = await getInspectionWorklogs(projectId);
        data = inspectionData.map(worklog => ({
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
      setWorklogs([]);
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
      } else if (processId === 'Coating') {
        await deleteCoatingWorklog(projectId, worklogId);
      } else if (processId === 'Press') {
        await deletePressWorklog(projectId, worklogId);
      } else if (processId === 'Notching') {
        await deleteNotchingWorklog(projectId, worklogId);
      } else if (processId === 'VD') {
        await deleteVdWorklog(projectId, worklogId);
      } else if (processId === 'Forming') {
        await deleteFormingWorklog(projectId, worklogId);
      } else if (processId === 'Stacking') {
        await deleteStackingWorklog(projectId, worklogId);
      } else if (processId === 'Welding') {
        await deleteWeldingWorklog(projectId, worklogId);
      } else if (processId === 'Sealing') {
        await deleteSealingWorklog(projectId, worklogId);
      } else if (processId === 'Filling') {
        await deleteFillingWorklog(projectId, worklogId);
      } else if (processId === 'Formation') {
        await deleteFormationWorklog(projectId, worklogId);
      } else if (processId === 'Grading') {
        await deleteGradingWorklog(projectId, worklogId);
      } else if (processId === 'Inspection') {
        await deleteInspectionWorklog(projectId, worklogId);
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
