import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../api/errorHandler';
import styles from '../../../styles/project/worklog/WorklogList.module.css';
import TooltipButton from '../../../components/TooltipButton';
import type { WorklogEntry } from './WorklogTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
import {
  getWorklogs,
  getBinderWorklogs,
  deleteBinderWorklog,
  getSlurryWorklogs,
  deleteSlurryWorklog,
  getCoatingWorklogs,
  deleteCoatingWorklog,
  getPressWorklogs,
  deletePressWorklog,
  getNotchingWorklogs,
  deleteNotchingWorklog,
  getVdWorklogs,
  deleteVdWorklog,
  getFormingWorklogs,
  deleteFormingWorklog,
  getStackingWorklogs,
  deleteStackingWorklog,
  getWeldingWorklogs,
  deleteWeldingWorklog,
  getSealingWorklogs,
  deleteSealingWorklog,
  getFillingWorklogs,
  deleteFillingWorklog,
  getFormationWorklogs,
  deleteFormationWorklog,
  getGradingWorklogs,
  deleteGradingWorklog,
  getInspectionWorklogs,
  deleteInspectionWorklog,
} from '../../../api/project/worklog';

interface WorklogListProps {
  projectId: number;
  processId: string;
  processTitle: string;
}

export default function WorklogList({ projectId, processId, processTitle }: WorklogListProps) {
  const navigate = useNavigate();
  const [worklogs, setWorklogs] = useState<WorklogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [downloading, setDownloading] = useState(false);

  const loadWorklogs = async () => {
    setLoading(true);
    setFetchError(false);
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
      setFetchError(true);
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
      alert(getErrorMessage(err, '삭제에 실패했습니다.'));
    }
  };

  // 모달 열기
  const openModal = () => {
    setSelectedIds([]);
    setIsModalOpen(true);
  };

  // 체크박스 토글
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedIds.length === worklogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(worklogs.map(w => w.id));
    }
  };

  // 엑셀 다운로드
  const handleDownload = async () => {
    if (selectedIds.length === 0) return;

    setDownloading(true);
    try {
      const response = await fetch(`${API_BASE}/worklog/${processId.toLowerCase()}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectId, worklogIds: selectedIds }),
      });

      if (!response.ok) {
        throw new Error('다운로드 실패');
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'worklog.xlsx';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match) {
          filename = decodeURIComponent(match[1]);
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      setIsModalOpen(false);
    } catch (err) {
      console.error('다운로드 실패:', err);
      alert(getErrorMessage(err, '다운로드에 실패했습니다.'));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p>작업일지를 불러오는 중...</p>;
  if (fetchError) return <p style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>서버와 연결할 수 없습니다.</p>;

  return (
    <div className={styles.worklogListContainer}>
      <div className={styles.header}>
        <h3>{processTitle} 작업일지</h3>
        <div className={styles.headerButtons}>
          <button className={styles.downloadBtn} onClick={openModal}>
            📥 엑셀 다운로드
          </button>
          <TooltipButton
            label='등록'
            variant='register'
            onClick={() => navigate(`/project/log/${projectId}/${processId.toLowerCase()}/register`)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
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
                      onClick={() => navigate(`/project/log/${projectId}/${processId.toLowerCase()}/view/${log.id}`)}
                    />
                    <TooltipButton
                      label='수정'
                      variant='edit'
                      onClick={() => navigate(`/project/log/${projectId}/${processId.toLowerCase()}/edit/${log.id}`)}
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

      {/* 엑셀 다운로드 모달 */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>작업일지 선택</h3>
              <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              {worklogs.length === 0 ? (
                <p className={styles.emptyMessage}>다운로드할 작업일지가 없습니다.</p>
              ) : (
                <>
                  <div className={styles.selectAllRow}>
                    <label>
                      <input
                        type='checkbox'
                        checked={selectedIds.length === worklogs.length}
                        onChange={toggleSelectAll}
                      />
                      전체 선택 ({selectedIds.length}/{worklogs.length})
                    </label>
                  </div>
                  <div className={styles.worklogCheckList}>
                    {worklogs.map(log => (
                      <label key={log.id} className={styles.checkItem}>
                        <input
                          type='checkbox'
                          checked={selectedIds.includes(log.id)}
                          onChange={() => toggleSelect(log.id)}
                        />
                        <span className={styles.checkItemDate}>{log.workDate}</span>
                        <span className={styles.checkItemRound}>{log.round}회차</span>
                        <span className={styles.checkItemWriter}>{log.createdBy}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalCancelBtn} onClick={() => setIsModalOpen(false)}>
                취소
              </button>
              <button
                className={styles.modalDownloadBtn}
                onClick={handleDownload}
                disabled={selectedIds.length === 0 || downloading}
              >
                {downloading ? '다운로드 중...' : `다운로드 (${selectedIds.length}건)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
