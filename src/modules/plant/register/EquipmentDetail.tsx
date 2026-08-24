import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../../styles/plant/Equipment.module.css';
import { getMaintenanceRecords } from '../../../api/plant/MaintenanceService';
import type { Equipment, EquipmentCategory } from './EquipmentTypes';
import type { MaintenanceRecord } from '../maintenance/MaintenanceTypes';

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  '생산': '생산',
  '개발': '개발',
  '측정': '측정',
};

export default function EquipmentDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const equipment = state?.equipment as Equipment | undefined;
  const category = (state?.category || equipment?.category) as EquipmentCategory | undefined;

  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const loadRecords = async () => {
    if (!equipment) return;
    setLoading(true);
    setFetchError(false);
    try {
      const data = await getMaintenanceRecords(equipment.id);
      setRecords(data);
    } catch (error) {
      console.error('유지보수 이력 조회 실패:', error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment?.id]);

  if (!equipment || !category) {
    return (
      <div className={styles.detailPage}>
        <div className={styles.errorState}>설비 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const isMeasurement = category === '측정';

  const handleRegisterMaintenance = () => {
    navigate('/plant/production/history/form', {
      state: {
        record: { equipmentId: equipment.id },
        equipment,
      },
    });
  };

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailHeader}>
        <div className={styles.detailTitleGroup}>
          <h3>{equipment.name}</h3>
          <span className={styles.categoryBadge}>{CATEGORY_LABELS[category]} 설비</span>
        </div>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
      </div>

      <div className={styles.infoCard}>
        <dl className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <dt>자산번호</dt>
            <dd>{equipment.assetNo || '-'}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>설비번호</dt>
            <dd>{equipment.equipmentNo}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>설비명</dt>
            <dd>{equipment.name}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>제조사</dt>
            <dd>{equipment.manufacturer}</dd>
          </div>

          <div className={styles.infoItem}>
            <dt>구입일자</dt>
            <dd>{equipment.purchaseDate || '-'}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>설비등급</dt>
            <dd>{equipment.grade}</dd>
          </div>
          <div className={styles.infoItem}>
            <dt>보전방법</dt>
            <dd>{equipment.maintenanceMethod}</dd>
          </div>
          {!isMeasurement && (
            <div className={styles.infoItem}>
              <dt>비고</dt>
              <dd>{equipment.remark || '-'}</dd>
            </div>
          )}

          {isMeasurement && (
            <>
              <hr className={styles.infoDivider} />
              <div className={styles.infoItem}>
                <dt>기기번호</dt>
                <dd>{equipment.deviceNo || '-'}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>교정일</dt>
                <dd>{equipment.calibrationDate || '-'}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>차기 교정일</dt>
                <dd>{equipment.nextCalibrationDate || '-'}</dd>
              </div>
              <div className={styles.infoItem}>
                <dt>검교정 기관</dt>
                <dd>{equipment.calibrationAgency || '-'}</dd>
              </div>
              <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                <dt>비고</dt>
                <dd>{equipment.remark || '-'}</dd>
              </div>
            </>
          )}
        </dl>
      </div>

      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <h3>유지보수 이력</h3>
          {!loading && !fetchError && <span className={styles.countBadge}>{records.length}건</span>}
        </div>
        {category === '생산' && (
          <button className={styles.registerBtn} onClick={handleRegisterMaintenance}>
            + 유지보수 등록
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : fetchError ? (
        <div className={styles.errorState}>서버와 연결할 수 없습니다.</div>
      ) : records.length === 0 ? (
        <div className={styles.emptyState}>등록된 유지보수 기록이 없습니다.</div>
      ) : (
        <table className={styles.equipmentTable}>
          <thead>
            <tr>
              <th>점검일자</th>
              <th>교체 이력</th>
              <th>사용 부품</th>
              <th>보수자</th>
              <th>확인자</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                <td>{record.inspectionDate}</td>
                <td className={styles.multiline}>{record.replacementHistory}</td>
                <td className={styles.multiline}>{record.usedParts}</td>
                <td className={styles.multiline}>{record.maintainer}</td>
                <td className={styles.multiline}>{record.verifier}</td>
                <td className={styles.multiline}>{record.remark || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
