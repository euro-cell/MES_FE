import { useState, useEffect } from 'react';
import { getSlurryMixingInfo, type SlurryMixingInfo } from '../../../../api/project/worklog';
import styles from '../../../../styles/project/worklog/MixingInfoModal.module.css';

interface MixingInfoModalProps {
  projectId: string;
  onClose: () => void;
  onSelect: (mixingInfo: SlurryMixingInfo) => void;
}

export default function MixingInfoModal({ projectId, onClose, onSelect }: MixingInfoModalProps) {
  const [mixingInfoList, setMixingInfoList] = useState<SlurryMixingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const loadMixingInfo = async () => {
      try {
        const data = await getSlurryMixingInfo(Number(projectId));
        setMixingInfoList(data);
      } catch (err) {
        console.error('믹싱 정보 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMixingInfo();
  }, [projectId]);

  const handleSelect = () => {
    const selected = mixingInfoList.find(info => info.id === selectedId);
    if (selected) {
      onSelect(selected);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Slurry 믹싱 정보 선택</h3>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalContent}>
          {loading ? (
            <p className={styles.loadingText}>믹싱 정보를 불러오는 중...</p>
          ) : mixingInfoList.length === 0 ? (
            <p className={styles.emptyText}>등록된 Slurry 작업일지가 없습니다.</p>
          ) : (
            <table className={styles.mixingInfoTable}>
              <thead>
                <tr>
                  <th>작업일</th>
                  <th>회차</th>
                  <th>LOT</th>
                  <th>바인더 투입량설계</th>
                </tr>
              </thead>
              <tbody>
                {mixingInfoList.map(info => (
                  <tr
                    key={info.id}
                    className={selectedId === info.id ? styles.selected : ''}
                    onClick={() => setSelectedId(info.id)}
                  >
                    <td>{info.workDate}</td>
                    <td>{info.round}</td>
                    <td>{info.lot ?? '-'}</td>
                    <td>{info.binderPlannedInput?.toFixed(3) ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button
            className={styles.selectButton}
            onClick={handleSelect}
            disabled={selectedId === null}
          >
            선택
          </button>
        </div>
      </div>
    </div>
  );
}
