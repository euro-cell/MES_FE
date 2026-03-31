import { useEffect, useRef, useState } from 'react';
import { getManualList, uploadManual, deleteManual, downloadManual, viewManual } from '../../../api/plant/ManualService';
import type { EquipmentManual } from '../../../api/plant/ManualService';
import styles from '../../../styles/plant/Equipment.module.css';

interface ManualModalProps {
  show: boolean;
  equipmentId: number;
  equipmentName: string;
  onClose: () => void;
}

export default function ManualModal({ show, equipmentId, equipmentName, onClose }: ManualModalProps) {
  const [manualList, setManualList] = useState<EquipmentManual[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadManualList = async () => {
    setLoading(true);
    try {
      const data = await getManualList(equipmentId);
      setManualList(data);
    } catch (err) {
      console.error('매뉴얼 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) loadManualList();
    else setManualList([]);
  }, [show, equipmentId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadManual(equipmentId, file);
      await loadManualList();
    } catch (err) {
      console.error('매뉴얼 업로드 실패:', err);
      alert('업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('매뉴얼을 삭제하시겠습니까?')) return;
    try {
      await deleteManual(id);
      await loadManualList();
    } catch (err) {
      console.error('매뉴얼 삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleView = async (id: number, fileName: string) => {
    try {
      await viewManual(id, fileName);
    } catch (err) {
      console.error('매뉴얼 열기 실패:', err);
      alert('파일 열기에 실패했습니다.');
    }
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      await downloadManual(id, fileName);
    } catch (err) {
      console.error('매뉴얼 다운로드 실패:', err);
      alert('다운로드에 실패했습니다.');
    }
  };

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onMouseDown={handleOverlayMouseDown}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h3>매뉴얼 관리</h3>
            <p className={styles.modalSubInfo}>{equipmentName}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.uploadArea}>
            <input
              ref={fileInputRef}
              type="file"
              id="manualFileInput"
              className={styles.fileInput}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="manualFileInput" className={`${styles.uploadButton} ${uploading ? styles.disabled : ''}`}>
              {uploading ? '업로드 중...' : '📎 업로드'}
            </label>
          </div>

          {loading ? (
            <p className={styles.loadingText}>불러오는 중...</p>
          ) : manualList.length === 0 ? (
            <p className={styles.emptyText}>등록된 매뉴얼이 없습니다.</p>
          ) : (
            <table className={styles.modalTable}>
              <thead>
                <tr>
                  <th>파일명</th>
                  <th>등록일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {manualList.map(manual => (
                  <tr key={manual.id}>
                    <td
                      className={styles.fileNameCell}
                      onClick={() => handleView(manual.id, manual.fileName)}
                      style={{ cursor: 'pointer' }}
                    >
                      {manual.fileName}
                    </td>
                    <td>{new Date(manual.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td className={styles.actionCell}>
                      <button className={styles.downloadButton} onClick={() => handleDownload(manual.id, manual.fileName)}>
                        다운로드
                      </button>
                      <button className={styles.deleteButton} onClick={() => handleDelete(manual.id)}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
