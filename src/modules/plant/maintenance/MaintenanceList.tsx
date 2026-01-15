import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/plant/Equipment.module.css';
import { getMaintenanceRecords, deleteMaintenanceRecord } from './MaintenanceService';
import type { MaintenanceRecord } from './MaintenanceTypes';

export default function MaintenanceList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getMaintenanceRecords();
      setRecords(data);
    } catch (error) {
      console.error('유지보수 기록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;

    try {
      await deleteMaintenanceRecord(id);
      alert('삭제되었습니다.');
      loadData();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleEdit = (record: MaintenanceRecord) => {
    navigate('form', { state: { record } });
  };

  const handleDownload = async () => {
    try {
      const { downloadMaintenanceExcel } = await import('./MaintenanceService');
      await downloadMaintenanceExcel();
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      alert('엑셀 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className={styles.equipmentPage}>
      <div className={styles.header}>
        <h3>유지보수 관리 대장</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.downloadBtn} onClick={handleDownload}>
            📥 엑셀 다운로드
          </button>
          <button className={styles.registerBtn} onClick={() => navigate('form')}>
            + 유지보수 등록
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : records.length === 0 ? (
        <div className={styles.emptyState}>등록된 유지보수 기록이 없습니다.</div>
      ) : (
        <table className={styles.equipmentTable}>
          <thead>
            <tr>
              <th>점검일자</th>
              <th>자산번호</th>
              <th>설비번호</th>
              <th>설비명</th>
              <th>교체 이력</th>
              <th>사용 부품</th>
              <th>보수자</th>
              <th>확인자</th>
              <th>비고</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td>{record.inspectionDate}</td>
                <td>{record.assetNo}</td>
                <td>{record.equipmentNo}</td>
                <td>{record.equipmentName}</td>
                <td className={styles.multiline}>{record.replacementHistory}</td>
                <td className={styles.multiline}>{record.usedParts}</td>
                <td className={styles.multiline}>{record.maintainer}</td>
                <td className={styles.multiline}>{record.verifier}</td>
                <td className={styles.multiline}>{record.remark || '-'}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.editBtn} onClick={() => handleEdit(record)}>
                      수정
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(record.id)}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
