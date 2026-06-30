import { useEffect, useState } from 'react';
import {
  getAssemblyMaterials,
  createAssemblyMaterial,
  updateAssemblyMaterial,
  deleteAssemblyMaterial,
  getAssemblyHistory,
  importAssemblyMaterials,
  downloadAssemblyExcel,
  deleteAssemblyHistories,
  deleteAllAssemblyHistories,
} from '../../../../api/stock/material/AssemblyMaterialService';
import type { AssemblyMaterial, MaterialHistory } from './types';
import AddAssemblyModal from './AddAssemblyModal';
import DeleteAssemblyModal from './DeleteAssemblyModal';
import UploadMaterialModal, { type MaterialUploadData } from '../shared/UploadMaterialModal';
import CoAModal from '../shared/CoAModal';
import MaterialTable from '../shared/MaterialTable';
import { getErrorMessage } from '../../../../api/errorHandler';
import styles from '../../../../styles/stock/material/assembly.module.css';

const INITIAL_FORM_DATA: Omit<AssemblyMaterial, 'id'> = {
  process: '조립',
  category: '',
  type: '',
  purpose: '',
  name: '',
  spec: '',
  lotNo: '',
  company: '',
  origin: '국내',
  unit: '',
  price: 0,
  note: '',
  stock: 0,
};

export default function AssemblyList() {
  const [materials, setMaterials] = useState<AssemblyMaterial[]>([]);
  const [histories, setHistories] = useState<MaterialHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [includeZeroStock, setIncludeZeroStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<AssemblyMaterial, 'id'>>(INITIAL_FORM_DATA);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [coaMaterial, setCoaMaterial] = useState<AssemblyMaterial | null>(null);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<number>>(new Set());
  const [showDeleteHistoryConfirm, setShowDeleteHistoryConfirm] = useState<'selected' | 'all' | null>(null);

  const loadMaterials = async (includeZero: boolean = false) => {
    try {
      const data = await getAssemblyMaterials(includeZero);
      setMaterials(data);
      setError(false);
    } catch (err) {
      console.error('❌ 조립 자재 조회 실패:', err);
      setError(true);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (page: number = 1) => {
    try {
      const response = await getAssemblyHistory(page);
      setHistories(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error('❌ 조립 입/출고 이력 조회 실패:', err);
      setHistories([]);
    }
  };

  const handleShowHistoryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowHistory(checked);
    setSelectedHistoryIds(new Set());
    if (checked && histories.length === 0) {
      await loadHistory(1);
    }
  };

  const handleToggleHistorySelect = (id: number) => {
    setSelectedHistoryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedHistoryIds.size === histories.length) {
      setSelectedHistoryIds(new Set());
    } else {
      setSelectedHistoryIds(new Set(histories.map(h => h.id)));
    }
  };

  const handleDeleteSelectedHistories = async () => {
    try {
      await deleteAssemblyHistories(Array.from(selectedHistoryIds));
      setSelectedHistoryIds(new Set());
      setShowDeleteHistoryConfirm(null);
      await loadHistory(1);
    } catch (err) {
      console.error('이력 삭제 실패:', err);
      alert(`이력 삭제에 실패했습니다.\n${getErrorMessage(err)}`);
    }
  };

  const handleDeleteAllHistories = async () => {
    try {
      await deleteAllAssemblyHistories();
      setSelectedHistoryIds(new Set());
      setShowDeleteHistoryConfirm(null);
      setHistories([]);
      setCurrentPage(1);
      setTotalPages(1);
    } catch (err) {
      console.error('전체 이력 삭제 실패:', err);
      alert(`이력 삭제에 실패했습니다.\n${getErrorMessage(err)}`);
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      await loadHistory(currentPage - 1);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      await loadHistory(currentPage + 1);
    }
  };

  const handleIncludeZeroStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIncludeZeroStock(checked);
    loadMaterials(checked);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleEditMaterial = (material: AssemblyMaterial) => {
    setEditingId(material.id);
    setFormData({
      process: material.process,
      category: material.category,
      type: material.type,
      purpose: material.purpose,
      name: material.name,
      spec: material.spec || '',
      lotNo: material.lotNo || '',
      company: material.company || '',
      origin: material.origin,
      unit: material.unit,
      price: material.price || 0,
      note: material.note || '',
      stock: material.stock || 0,
    });
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await updateAssemblyMaterial(editingId, formData);
      } else {
        await createAssemblyMaterial(formData);
      }
      loadMaterials(includeZeroStock);
      if (showHistory) {
        await loadHistory(1);
      } else {
        setHistories([]);
        setCurrentPage(1);
      }
      handleCloseModal();
    } catch (err) {
      console.error('자재 처리 실패:', err);
      alert(getErrorMessage(err, '자재 처리에 실패했습니다.'));
    }
  };

  const handleDeleteMaterial = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (isHardDelete: boolean) => {
    if (deletingId === null) return;
    try {
      await deleteAssemblyMaterial(deletingId, isHardDelete);
      loadMaterials(includeZeroStock);
      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (err) {
      console.error('자재 삭제 실패:', err);
      alert(getErrorMessage(err, '자재 삭제에 실패했습니다.'));
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  const handleDownload = async () => {
    try {
      await downloadAssemblyExcel();
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      alert(getErrorMessage(error, '엑셀 다운로드에 실패했습니다.'));
    }
  };

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleOpenCoAModal = (material: AssemblyMaterial) => {
    setCoaMaterial(material);
  };

  const handleCloseCoAModal = () => {
    setCoaMaterial(null);
  };

  const handleImportMaterials = async (data: MaterialUploadData[]) => {
    const result = await importAssemblyMaterials(data);
    // 데이터 새로고침
    await loadMaterials(includeZeroStock);
    return result;
  };

  useEffect(() => {
    loadMaterials(includeZeroStock);
  }, []);

  if (loading) return <p style={{ padding: '20px', color: '#64748b', fontSize: '14px' }}>데이터를 불러오는 중...</p>;

  return (
    <div className={styles.assemblyList}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>조립 자재 목록</h2>
          {!showHistory && (
            <label className={styles.checkboxLabel}>
              <input
                type='checkbox'
                checked={includeZeroStock}
                onChange={handleIncludeZeroStockChange}
                className={styles.checkbox}
              />
              <span>재고가 없는 자재도 포함</span>
            </label>
          )}
          <label className={styles.checkboxLabel}>
            <input
              type='checkbox'
              checked={showHistory}
              onChange={handleShowHistoryChange}
              className={styles.checkbox}
            />
            <span>입/출고 이력 보기</span>
          </label>
          {!showHistory && (
            <>
              <button className={styles.downloadButton} onClick={handleDownload}>
                📥 엑셀 다운로드
              </button>
              <button className={styles.uploadButton} onClick={handleUpload}>
                📤 엑셀 업로드
              </button>
            </>
          )}
        </div>
        {!showHistory && (
          <button className={styles.addButton} onClick={handleOpenModal}>
            + 추가
          </button>
        )}
      </div>

      {!showHistory ? (
        error ? (
          <p className={styles.errorMessage}>서버와 연결할 수 없습니다.</p>
        ) : (
          <MaterialTable
            data={materials}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
            onCoA={handleOpenCoAModal}
          />
        )
      ) : (
        <>
          <div className={styles.historyToolbar}>
            <span className={styles.historyNotice}>ℹ️ 생성일 기준 6개월이 경과한 이력은 자동으로 삭제됩니다.</span>
            <div className={styles.historyActions}>
              {selectedHistoryIds.size > 0 && (
                <span className={styles.historySelectedInfo}>{selectedHistoryIds.size}개 선택됨</span>
              )}
              <button
                className={styles.deleteSelectedButton}
                onClick={() => setShowDeleteHistoryConfirm('selected')}
                disabled={selectedHistoryIds.size === 0}
              >
                선택 삭제
              </button>
              <button
                className={styles.deleteAllButton}
                onClick={() => setShowDeleteHistoryConfirm('all')}
                disabled={histories.length === 0}
              >
                전체 삭제
              </button>
            </div>
          </div>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input
                    type='checkbox'
                    className={styles.checkbox}
                    checked={histories.length > 0 && selectedHistoryIds.size === histories.length}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th>날짜</th>
                <th>제품명</th>
                <th>Lot No.</th>
                <th>수량</th>
                <th>사유</th>
              </tr>
            </thead>
            <tbody>
              {histories.length > 0 ? (
                histories.map(history => (
                  <tr key={history.id} className={selectedHistoryIds.has(history.id) ? styles.selectedRow : ''}>
                    <td className={styles.checkboxCell}>
                      <input
                        type='checkbox'
                        className={styles.checkbox}
                        checked={selectedHistoryIds.has(history.id)}
                        onChange={() => handleToggleHistorySelect(history.id)}
                      />
                    </td>
                    <td>{new Date(history.createdAt).toLocaleString('ko-KR')}</td>
                    <td>{history.material?.name || '-'}</td>
                    <td>{history.material?.lotNo || '-'}</td>
                    <td>
                      {history.previousStock % 1 === 0 ? Math.trunc(history.previousStock) : history.previousStock} → {history.currentStock % 1 === 0 ? Math.trunc(history.currentStock) : history.currentStock}
                    </td>
                    <td>{history.type || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyMessage}>
                    입/출고 이력이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {histories.length > 0 && (
            <div className={styles.pagination}>
              <button className={styles.pageButton} onClick={handlePreviousPage} disabled={currentPage === 1}>
                이전
              </button>
              <span className={styles.pageInfo}>
                {currentPage} / {totalPages}
              </span>
              <button className={styles.pageButton} onClick={handleNextPage} disabled={currentPage === totalPages}>
                다음
              </button>
            </div>
          )}
          {showDeleteHistoryConfirm && (
            <div className={styles.confirmOverlay}>
              <div className={styles.confirmDialog}>
                <p className={styles.confirmMessage}>
                  {showDeleteHistoryConfirm === 'all'
                    ? '입/출고 이력을 전체 삭제하시겠습니까?'
                    : `선택한 ${selectedHistoryIds.size}개의 이력을 삭제하시겠습니까?`}
                </p>
                <div className={styles.confirmButtons}>
                  <button
                    className={styles.confirmCancelButton}
                    onClick={() => setShowDeleteHistoryConfirm(null)}
                  >
                    취소
                  </button>
                  <button
                    className={styles.confirmDeleteButton}
                    onClick={showDeleteHistoryConfirm === 'all' ? handleDeleteAllHistories : handleDeleteSelectedHistories}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <AddAssemblyModal
        show={showModal}
        isEditing={editingId !== null}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      <DeleteAssemblyModal show={showDeleteModal} onConfirm={handleDeleteConfirm} onClose={handleCloseDeleteModal} />

      <UploadMaterialModal
        show={showUploadModal}
        onClose={handleCloseUploadModal}
        onImport={handleImportMaterials}
        processType='조립'
      />

      {coaMaterial && (
        <CoAModal
          show={true}
          materialId={coaMaterial.id}
          materialName={coaMaterial.name}
          lotNo={coaMaterial.lotNo}
          process='조립'
          onClose={handleCloseCoAModal}
        />
      )}
    </div>
  );
}
