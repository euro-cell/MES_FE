import { useEffect, useRef, useState } from 'react';
import { getCoAList, uploadCoA, deleteCoA, downloadCoA, viewCoA } from '../../../../api/stock/material/CoAService';
import type { MaterialCoa } from '../../../../api/stock/material/CoAService';
import styles from '../../../../styles/stock/material/coaModal.module.css';
import { getErrorMessage } from '../../../../api/errorHandler';

interface CoAModalProps {
  show: boolean;
  materialId: number;
  materialName: string;
  lotNo?: string;
  process: string;
  onClose: () => void;
}

export default function CoAModal({ show, materialId, materialName, lotNo, process, onClose }: CoAModalProps) {
  const [coaList, setCoaList] = useState<MaterialCoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCoAList = async () => {
    setLoading(true);
    try {
      const data = await getCoAList(materialId);
      setCoaList(data);
    } catch (err) {
      console.error('CoA 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) loadCoAList();
    else setCoaList([]);
  }, [show, materialId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadCoA(materialId, process, file);
      await loadCoAList();
    } catch (err: any) {
      console.error('CoA 업로드 실패:', err);
      alert(getErrorMessage(err, '업로드에 실패했습니다.'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('CoA를 삭제하시겠습니까?')) return;
    try {
      await deleteCoA(id);
      await loadCoAList();
    } catch (err: any) {
      console.error('CoA 삭제 실패:', err);
      alert(getErrorMessage(err, '삭제에 실패했습니다.'));
    }
  };

  const handleView = async (id: number, fileName: string) => {
    try {
      await viewCoA(id, fileName);
    } catch (err: any) {
      console.error('CoA 열기 실패:', err);
      alert(getErrorMessage(err, '파일 열기에 실패했습니다.'));
    }
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      await downloadCoA(id, fileName);
    } catch (err: any) {
      console.error('CoA 다운로드 실패:', err);
      alert(getErrorMessage(err, '다운로드에 실패했습니다.'));
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
            <h3>CoA 관리</h3>
            <p className={styles.materialInfo}>
              {materialName} {lotNo ? `(Lot: ${lotNo})` : ''}
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.uploadArea}>
            <input
              ref={fileInputRef}
              type='file'
              id='coaFileInput'
              className={styles.fileInput}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor='coaFileInput' className={`${styles.uploadButton} ${uploading ? styles.disabled : ''}`}>
              {uploading ? '업로드 중...' : '📎 업로드'}
            </label>
          </div>

          {loading ? (
            <p className={styles.loadingText}>불러오는 중...</p>
          ) : coaList.length === 0 ? (
            <p className={styles.emptyText}>등록된 CoA가 없습니다.</p>
          ) : (
            <table className={styles.coaTable}>
              <thead>
                <tr>
                  <th>파일명</th>
                  <th>등록일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {coaList.map(coa => (
                  <tr key={coa.id}>
                    <td className={styles.fileNameCell} onClick={() => handleView(coa.id, coa.fileName)} style={{ cursor: 'pointer' }}>{coa.fileName}</td>
                    <td>{new Date(coa.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td className={styles.actionCell}>
                      <button className={styles.downloadButton} onClick={() => handleDownload(coa.id, coa.fileName)}>
                        다운로드
                      </button>
                      <button className={styles.deleteButton} onClick={() => handleDelete(coa.id)}>
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
