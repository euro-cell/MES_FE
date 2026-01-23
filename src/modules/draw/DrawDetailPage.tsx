import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import styles from '../../styles/draw/Drawing.module.css';
import { getDrawingById, addVersion } from './DrawService';
import type { Drawing } from './DrawTypes';
import TooltipButton from '../../components/TooltipButton';
import PdfViewer from '../../components/PdfViewer';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** data/ 경로를 URL로 변환 */
const toFileUrl = (filePath: string) => {
  // 백슬래시를 슬래시로 변환 후 data/ 제거
  const normalized = filePath.replace(/\\/g, '/');
  return `${API_BASE}/${normalized.replace('data/', '')}`;
};

interface PdfFile {
  version: number;
  fileName: string;
  fileUrl?: string;
}

interface VersionFormData {
  version: number | '';
  registrationDate: string;
  changeNote: string;
  drawingFile: File | null;
  pdfFiles: File[];
}

const initialVersionForm: VersionFormData = {
  version: '',
  registrationDate: new Date().toISOString().split('T')[0],
  changeNote: '',
  drawingFile: null,
  pdfFiles: [],
};

export default function DrawDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drawing, setDrawing] = useState<Drawing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPdfIndex, setSelectedPdfIndex] = useState(0);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionForm, setVersionForm] = useState<VersionFormData>(initialVersionForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDrawing = async () => {
      try {
        const drawing = await getDrawingById(Number(id));
        setDrawing(drawing);
      } catch (err) {
        console.error('도면 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDrawing();
  }, [id]);

  // 버전 정렬 (모든 Hook 이후에 호출)
  const sortedVersions = useMemo(() => {
    if (!drawing) return [];
    return [...drawing.versions].sort(
      (a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime(),
    );
  }, [drawing]);

  // 모든 버전의 PDF 파일 목록 수집
  const allPdfFiles: PdfFile[] = useMemo(() => {
    const files: PdfFile[] = [];
    sortedVersions.forEach(ver => {
      console.log('pdfFilePaths:', ver.pdfFilePaths);
      ver.pdfFileNames.forEach((fileName, idx) => {
        const filePath = ver.pdfFilePaths[idx];
        const url = filePath ? toFileUrl(filePath) : '';
        console.log('filePath:', filePath, '-> url:', url);
        files.push({
          version: ver.version,
          fileName,
          fileUrl: url,
        });
      });
    });
    return files;
  }, [sortedVersions]);

  // 파일 다운로드 함수
  const handleDownload = async (fileName: string, filePath: string) => {
    try {
      const url = toFileUrl(filePath);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('파일 다운로드 실패:', err);
      toast.error('파일 다운로드에 실패했습니다.');
    }
  };

  const selectedPdf = allPdfFiles[selectedPdfIndex] || null;

  // 버전 추가 모달 열기
  const openVersionModal = () => {
    setVersionForm(initialVersionForm);
    setShowVersionModal(true);
  };

  // 버전 추가 모달 닫기
  const closeVersionModal = () => {
    setShowVersionModal(false);
    setVersionForm(initialVersionForm);
  };

  // 버전 폼 입력 핸들러
  const handleVersionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'version') {
      const numValue: number | '' = value === '' ? '' : parseFloat(value);
      setVersionForm(prev => ({ ...prev, version: numValue }));
    } else {
      setVersionForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'drawingFile' | 'pdfFiles') => {
    const files = e.target.files;
    if (!files) return;

    if (field === 'drawingFile') {
      setVersionForm(prev => ({ ...prev, drawingFile: files[0] || null }));
    } else {
      setVersionForm(prev => ({ ...prev, pdfFiles: Array.from(files) }));
    }
  };

  // 버전 추가 제출
  const handleVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawing || !versionForm.version) return;

    setSubmitting(true);
    try {
      const updated = await addVersion(drawing.id, {
        version: versionForm.version as number,
        registrationDate: versionForm.registrationDate,
        changeNote: versionForm.changeNote || undefined,
        drawingFile: versionForm.drawingFile || undefined,
        pdfFiles: versionForm.pdfFiles.length > 0 ? versionForm.pdfFiles : undefined,
      });
      setDrawing(updated);
      closeVersionModal();
      toast.success('버전이 추가되었습니다.');
    } catch (err) {
      console.error('버전 추가 실패:', err);
      toast.error('버전 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  if (!drawing) {
    return (
      <div className={styles.ledgerPage}>
        <div className={styles.error}>도면을 찾을 수 없습니다.</div>
        <button className={styles.addButton} onClick={() => navigate(-1)}>
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className={styles.ledgerPage}>
      <div className={styles.detailHeader}>
        <h2>도면 상세 정보</h2>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          목록으로
        </button>
      </div>

      <div className={styles.detailSection}>
        <h3>기본 정보</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>카테고리</span>
            <span className={styles.infoValue}>{drawing.category}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>프로젝트명</span>
            <span className={styles.infoValue}>{drawing.projectName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>구분</span>
            <span className={styles.infoValue}>{drawing.division}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>도면번호</span>
            <span className={styles.infoValue}>{drawing.drawingNumber}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>현재 버전</span>
            <span className={styles.infoValue}>v{Number(drawing.currentVersion).toFixed(1)}</span>
          </div>
          <div className={`${styles.infoItem} ${styles.fullWidth}`}>
            <span className={styles.infoLabel}>도면 내용</span>
            <span className={styles.infoValue}>{drawing.description || '-'}</span>
          </div>
        </div>
      </div>

      <div className={styles.detailSection}>
        <div className={styles.sectionHeader}>
          <h3>버전 히스토리</h3>
          <TooltipButton label='버전 추가' variant='register' onClick={openVersionModal} />
        </div>
        <table className={styles.ledgerTable}>
          <thead>
            <tr>
              <th>버전</th>
              <th>등록일자</th>
              <th>변경사유</th>
              <th>도면 파일</th>
              <th>PDF 파일</th>
            </tr>
          </thead>
          <tbody>
            {sortedVersions.map(ver => (
              <tr key={ver.id}>
                <td>v{Number(ver.version).toFixed(1)}</td>
                <td>{ver.registrationDate}</td>
                <td>{ver.changeNote || '-'}</td>
                <td>
                  {ver.drawingFileName && ver.drawingFilePath ? (
                    <TooltipButton
                      label={ver.drawingFileName}
                      variant='view'
                      onClick={() => handleDownload(ver.drawingFileName!, ver.drawingFilePath!)}
                    />
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {ver.pdfFileNames.length > 0 ? (
                    <div className={styles.fileList}>
                      {ver.pdfFileNames.map((name, idx) => (
                        <TooltipButton
                          key={idx}
                          label={name}
                          variant='view'
                          onClick={() => handleDownload(name, ver.pdfFilePaths[idx])}
                        />
                      ))}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.detailSection}>
        <h3>PDF 뷰어</h3>
        {allPdfFiles.length > 0 ? (
          <>
            <div className={styles.pdfTabs}>
              {allPdfFiles.map((pdf, idx) => (
                <button
                  key={idx}
                  className={`${styles.pdfTab} ${selectedPdfIndex === idx ? styles.active : ''}`}
                  onClick={() => setSelectedPdfIndex(idx)}
                >
                  [v{Number(pdf.version).toFixed(1)}] {pdf.fileName}
                </button>
              ))}
            </div>
            <PdfViewer fileUrl={selectedPdf?.fileUrl} fileName={selectedPdf?.fileName} />
          </>
        ) : (
          <div className={styles.noPdf}>등록된 PDF 파일이 없습니다.</div>
        )}
      </div>

      {/* 버전 추가 모달 */}
      {showVersionModal && (
        <div className={styles.modalOverlay} onClick={closeVersionModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>버전 추가</h3>
              <button className={styles.closeButton} onClick={closeVersionModal}>
                ×
              </button>
            </div>
            <form className={styles.modalForm} onSubmit={handleVersionSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formRow}>
                  <label>버전 *</label>
                  <input
                    type='number'
                    step='0.1'
                    name='version'
                    value={versionForm.version}
                    onChange={handleVersionInputChange}
                    placeholder='예: 1.1, 2.0'
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <label>등록일자 *</label>
                  <input
                    type='date'
                    name='registrationDate'
                    value={versionForm.registrationDate}
                    onChange={handleVersionInputChange}
                    required
                  />
                </div>
                <div className={`${styles.formRow} ${styles.fullWidth}`}>
                  <label>변경사유</label>
                  <textarea
                    name='changeNote'
                    value={versionForm.changeNote}
                    onChange={handleVersionInputChange}
                    placeholder='변경 사유를 입력하세요'
                    rows={2}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>도면 파일 (.dwg)</label>
                  <input type='file' accept='.dwg' onChange={e => handleFileChange(e, 'drawingFile')} />
                </div>
                <div className={styles.formRow}>
                  <label>PDF 파일 (복수 선택 가능)</label>
                  <input type='file' accept='.pdf' multiple onChange={e => handleFileChange(e, 'pdfFiles')} />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type='button' className={styles.cancelButton} onClick={closeVersionModal}>
                  취소
                </button>
                <button type='submit' className={styles.submitButton} disabled={submitting}>
                  {submitting ? '추가 중...' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
