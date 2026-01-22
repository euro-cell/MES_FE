import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../../styles/draw/Drawing.module.css';
import { getDrawings, createDrawing } from './DrawService';
import type { DrawingListItem, DrawingCategory, DrawingCreatePayload } from './DrawTypes';
import TooltipButton from '../../components/TooltipButton';

const CATEGORY_OPTIONS: DrawingCategory[] = ['공장', '설비', '제품', 'OEM/ODM'];

const INITIAL_FORM: Omit<DrawingCreatePayload, 'drawingFile' | 'pdfFiles' | 'version'> & { drawingFile: File | null; pdfFiles: File[]; version: number | '' } = {
  category: '공장',
  projectName: '',
  division: '',
  drawingNumber: '',
  description: '',
  version: '',
  registrationDate: new Date().toISOString().split('T')[0],
  changeNote: '',
  drawingFile: null,
  pdfFiles: [],
};

export default function DrawPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category') as DrawingCategory | null;

  const [drawings, setDrawings] = useState<DrawingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isAddMode, setIsAddMode] = useState(false);

  // 프로젝트명(중분류) 기준으로 그룹핑
  const groupedDrawings = useMemo(() => {
    const groups: Record<string, DrawingListItem[]> = {};
    if (!Array.isArray(drawings)) return groups;
    drawings.forEach(d => {
      if (!groups[d.projectName]) {
        groups[d.projectName] = [];
      }
      groups[d.projectName].push(d);
    });
    return groups;
  }, [drawings]);

  // 데이터 로드 후 모든 그룹 펼침 상태로 초기화
  useEffect(() => {
    setExpandedGroups(new Set(Object.keys(groupedDrawings)));
  }, [groupedDrawings]);

  const toggleGroup = (projectName: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(projectName)) {
        next.delete(projectName);
      } else {
        next.add(projectName);
      }
      return next;
    });
  };

  const loadDrawings = async () => {
    try {
      setLoading(true);
      const params = category ? { category } : undefined;
      const data = await getDrawings(params);
      setDrawings(Array.isArray(data) ? data : []);
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
    if (name === 'version') {
      const numValue: number | '' = value === '' ? '' : parseFloat(value);
      setFormData(prev => ({ ...prev, version: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'pdfFiles') {
        setFormData(prev => ({ ...prev, pdfFiles: Array.from(files) }));
      } else {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await createDrawing({
        ...formData,
        version: formData.version as number,
        drawingFile: formData.drawingFile || undefined,
        pdfFiles: formData.pdfFiles.length > 0 ? formData.pdfFiles : undefined,
      });
      toast.success('도면이 등록되었습니다.');
      setShowModal(false);
      setFormData(INITIAL_FORM);
      loadDrawings();
    } catch (err) {
      console.error('도면 등록 실패:', err);
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error('이미 존재하는 도면번호입니다.');
      } else {
        toast.error('도면 등록에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(INITIAL_FORM);
    setIsAddMode(false);
  };

  return (
    <div className={styles.ledgerPage}>
      <div className={styles.header}>
        <button className={styles.addButton} onClick={() => {
          setIsAddMode(false);
          setShowModal(true);
        }}>
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
              <th style={{ width: '50px' }}></th>
              <th>등록일자</th>
              <th>프로젝트명 (공장명/제품명/설비명)</th>
              <th>도면번호</th>
              <th>버전</th>
              <th>도면 내용</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedDrawings).length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  등록된 도면이 없습니다.
                </td>
              </tr>
            ) : (
              Object.entries(groupedDrawings).map(([projectName, items]) => (
                <React.Fragment key={projectName}>
                  {/* 그룹 헤더 */}
                  <tr className={styles.groupHeader} onClick={() => toggleGroup(projectName)}>
                    <td>{expandedGroups.has(projectName) ? '▼' : '▶'}</td>
                    <td></td>
                    <td className={styles.projectName}>{projectName}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      {!expandedGroups.has(projectName) ? (
                        <span className={styles.itemCount}>({items.length})</span>
                      ) : (
                        <div
                          onClick={e => e.stopPropagation()}
                        >
                          <TooltipButton
                            label='추가'
                            variant='register'
                            onClick={() => {
                              setIsAddMode(true);
                              setFormData(prev => ({ ...prev, projectName, category: items[0].category }));
                              setShowModal(true);
                            }}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                  {/* 그룹 아이템 */}
                  {expandedGroups.has(projectName) && items.map((item, idx) => (
                    <tr key={item.id} className={styles.groupItem}>
                      <td>{idx + 1}</td>
                      <td>{item.latestRegistrationDate}</td>
                      <td>{item.division || '-'}</td>
                      <td>{item.drawingNumber}</td>
                      <td>v{Number(item.currentVersion).toFixed(1)}</td>
                      <td>{item.description || '-'}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <TooltipButton label='조회' variant='view' onClick={() => navigate(`/draw/detail/${item.id}`)} />
                          <TooltipButton label='수정' variant='edit' />
                          <TooltipButton label='삭제' variant='delete' />
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
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
              <div className={styles.formGrid}>
                {!isAddMode && (
                  <>
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
                        placeholder='예: 오산, 화성'
                        required
                      />
                    </div>
                  </>
                )}
                <div className={styles.formRow}>
                  <label>구분 *</label>
                  <input
                    type='text'
                    name='division'
                    value={formData.division}
                    onChange={handleInputChange}
                    placeholder='예: 1층, 2층, A동'
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <label>도면번호 *</label>
                  <input
                    type='text'
                    name='drawingNumber'
                    value={formData.drawingNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <label>버전 *</label>
                  <input type='number' step='0.1' name='version' value={formData.version} onChange={handleInputChange} placeholder='예: 1.0, 2.0' required />
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
                <div className={`${styles.formRow} ${styles.fullWidth}`}>
                  <label>도면 내용</label>
                  <textarea name='description' value={formData.description} onChange={handleInputChange} rows={2} />
                </div>
                <div className={`${styles.formRow} ${styles.fullWidth}`}>
                  <label>변경 사유</label>
                  <input type='text' name='changeNote' value={formData.changeNote} onChange={handleInputChange} />
                </div>
                <div className={styles.formRow}>
                  <label>도면 파일 (dwg/dxf)</label>
                  <input type='file' name='drawingFile' accept='.dwg,.dxf' onChange={handleFileChange} />
                </div>
                <div className={styles.formRow}>
                  <label>PDF 파일 (다중 선택 가능)</label>
                  <input type='file' name='pdfFiles' accept='.pdf' onChange={handleFileChange} multiple />
                </div>
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
