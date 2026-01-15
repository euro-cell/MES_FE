import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../../styles/plant/Equipment.module.css';
import { getEquipments, deleteEquipment } from './EquipmentService';
import type { Equipment, EquipmentCategory } from './EquipmentTypes';

interface Props {
  category: EquipmentCategory;
}

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  '생산': '생산 설비 관리 대장',
  '개발': '개발 설비 관리 대장',
  '측정': '측정 설비 관리 대장',
};

export default function EquipmentList({ category }: Props) {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getEquipments(category);
      setEquipments(data);
    } catch (error) {
      console.error('설비 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}" 설비를 삭제하시겠습니까?`)) return;

    try {
      await deleteEquipment(id);
      alert('삭제되었습니다.');
      loadData();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleEdit = (equipment: Equipment) => {
    navigate('form', { state: { equipment, category } });
  };

  const handleRegister = () => {
    navigate('form', { state: { category } });
  };

  const handleDownload = async () => {
    try {
      const { downloadEquipmentExcel } = await import('./EquipmentService');
      await downloadEquipmentExcel(category);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      alert('엑셀 다운로드에 실패했습니다.');
    }
  };

  const isMeasurement = category === '측정';

  return (
    <div className={styles.equipmentPage}>
      <div className={styles.header}>
        <h3>{CATEGORY_LABELS[category]}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.downloadBtn} onClick={handleDownload}>
            📥 엑셀 다운로드
          </button>
          <button className={styles.registerBtn} onClick={handleRegister}>
            + 설비 등록
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : equipments.length === 0 ? (
        <div className={styles.emptyState}>등록된 설비가 없습니다.</div>
      ) : (
        <table className={styles.equipmentTable}>
          <thead>
            <tr>
              <th>자산번호</th>
              <th>설비번호</th>
              <th>설비명</th>
              <th>제조사</th>
              {isMeasurement && <th>기기번호</th>}
              <th>구입일자</th>
              {isMeasurement && (
                <>
                  <th>교정일</th>
                  <th>차기 교정일</th>
                  <th>검교정 기관</th>
                </>
              )}
              <th>설비등급</th>
              <th>보전방법</th>
              <th>비고</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {equipments.map(eq => (
              <tr key={eq.id}>
                <td>{eq.assetNo}</td>
                <td>{eq.equipmentNo}</td>
                <td>{eq.name}</td>
                <td>{eq.manufacturer}</td>
                {isMeasurement && <td>{eq.deviceNo || '-'}</td>}
                <td>{eq.purchaseDate}</td>
                {isMeasurement && (
                  <>
                    <td>{eq.calibrationDate || '-'}</td>
                    <td>{eq.nextCalibrationDate || '-'}</td>
                    <td>{eq.calibrationAgency || '-'}</td>
                  </>
                )}
                <td>{eq.grade}</td>
                <td>{eq.maintenanceMethod}</td>
                <td>{eq.remark || '-'}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.editBtn} onClick={() => handleEdit(eq)}>
                      수정
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(eq.id, eq.name)}>
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
