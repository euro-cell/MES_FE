import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../../styles/draw/DrawingLedger.module.css';
import { getDrawings, createDrawing } from './DrawService';
import type { Drawing, DrawingCategory, DrawingCreatePayload } from './DrawTypes';

const CATEGORY_OPTIONS: DrawingCategory[] = ['공장', '설비', '제품', 'OEM/ODM'];

const INITIAL_FORM: Omit<DrawingCreatePayload, 'drawingFile' | 'pdfFile'> & { drawingFile: File | null; pdfFile: File | null } = {
  category: '공장',
  projectName: '',
  drawingNumber: '',
  description: '',
  version: '',
  registrationDate: new Date().toISOString().split('T')[0],
  changeNote: '',
  drawingFile: null,
  pdfFile: null,
};

export default function DrawPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category') as DrawingCategory | null;

  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadDrawings = async () => {
    try {
      setLoading(true);
      const params = category ? { category } : undefined;
      const data = await getDrawings(params);
      setDrawings(data);
      setError(false);
    } catch (err) {
      console.error('도면 목록 조회 실패:', err);
      setError(true);
      setDrawings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrawings();
  }, [category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.drawingFile) {
      alert('도면 파일을 선택해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await createDrawing({
        ...formData,
        drawingFile: formData.drawingFile,
        pdfFile: formData.pdfFile || undefined,
      });
      alert('도면이 등록되었습니다.');
      setShowModal(false);
      setFormData(INITIAL_FORM);
      loadDrawings();
    } catch (err) {
      console.error('도면 등록 실패:', err);
      alert('도면 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(INITIAL_FORM);
  };

  const getLatestRegistrationDate = (drawing: Drawing) => {
    if (drawing.versions.length === 0) return '-';
    const sorted = [...drawing.versions].sort(
      (a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
    );
    return sorted[0].registrationDate;
  };

  return (
    <div className={styles.ledgerPage}>
      <div className={styles.header}>
        <button className={styles.addButton} onClick={() => setShowModal(true)}>
          + 도면 등록
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>로딩 중...</div>
      ) : error ? (
        <div className={styles.error}>데이터를 불러오는데 실패했습니다.</div>
      ) : (
        <table className={styles.ledgerTable}>
          <thead>
            <tr>
              <th>No.</th>
              <th>등록일자</th>
              <th>프로젝트명 (공장명/제품명/설비명)</th>
              <th>도면 번호</th>
              <th>Version</th>
              <th>도면 내용</th>
            </tr>
          </thead>
          <tbody>
            {drawings.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  등록된 도면이 없습니다.
                </td>
              </tr>
            ) : (
              drawings.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{getLatestRegistrationDate(item)}</td>
                  <td>{item.projectName}</td>
                  <td>{item.drawingNumber}</td>
                  <td>{item.currentVersion}</td>
                  <td>{item.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>도면 등록</h3>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <label>카테고리 *</label>
                <select name='category' value={formData.category} onChange={handleInputChange} required>
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formRow}>
                <label>프로젝트명 *</label>
                <input
                  type='text'
                  name='projectName'
                  value={formData.projectName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <label>도면 번호 *</label>
                <input
                  type='text'
                  name='drawingNumber'
                  value={formData.drawingNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <label>도면 내용</label>
                <textarea name='description' value={formData.description} onChange={handleInputChange} rows={3} />
              </div>
              <div className={styles.formRow}>
                <label>버전 *</label>
                <input type='text' name='version' value={formData.version} onChange={handleInputChange} required />
              </div>
              <div className={styles.formRow}>
                <label>등록일자 *</label>
                <input
                  type='date'
                  name='registrationDate'
                  value={formData.registrationDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <label>변경 사유</label>
                <input type='text' name='changeNote' value={formData.changeNote} onChange={handleInputChange} />
              </div>
              <div className={styles.formRow}>
                <label>도면 파일 * (dwg/dxf)</label>
                <input type='file' name='drawingFile' accept='.dwg,.dxf' onChange={handleFileChange} required />
              </div>
              <div className={styles.formRow}>
                <label>PDF 파일</label>
                <input type='file' name='pdfFile' accept='.pdf' onChange={handleFileChange} />
              </div>
              <div className={styles.modalActions}>
                <button type='button' className={styles.cancelButton} onClick={handleCloseModal}>
                  취소
                </button>
                <button type='submit' className={styles.submitButton} disabled={submitting}>
                  {submitting ? '등록 중...' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
