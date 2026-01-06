import { useEffect, useState } from 'react';
import {
  getElectrodeMaterials,
  createElectrodeMaterial,
  updateElectrodeMaterial,
  deleteElectrodeMaterial,
  getElectrodeHistory,
} from './service';
import type { ElectrodeMaterial, MaterialHistory } from './types';
import AddMaterialModal from './AddMaterialModal';
import DeleteMaterialModal from './DeleteMaterialModal';
import styles from '../../../../styles/stock/material/electrode.module.css';

const INITIAL_FORM_DATA: Omit<ElectrodeMaterial, 'id'> = {
  process: '전극',
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

export default function ElectrodeList() {
  const [materials, setMaterials] = useState<ElectrodeMaterial[]>([]);
  const [histories, setHistories] = useState<MaterialHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [includeZeroStock, setIncludeZeroStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<ElectrodeMaterial, 'id'>>(INITIAL_FORM_DATA);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadMaterials = async (includeZero: boolean = false) => {
    try {
      const data = await getElectrodeMaterials(includeZero);
      setMaterials(data);
      setError(false);
    } catch (err) {
      console.error('❌ 전극 자재 조회 실패:', err);
      setError(true);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (page: number = 1) => {
    try {
      const response = await getElectrodeHistory(page);
      setHistories(response.data);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error('❌ 전극 입/출고 이력 조회 실패:', err);
      setHistories([]);
    }
  };

  const handleShowHistoryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowHistory(checked);
    if (checked && histories.length === 0) {
      await loadHistory(1);
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

  const handleEditMaterial = (material: ElectrodeMaterial) => {
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
        await updateElectrodeMaterial(editingId, formData);
      } else {
        await createElectrodeMaterial(formData);
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
    }
  };

  const handleDeleteMaterial = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (isHardDelete: boolean) => {
    if (deletingId === null) return;
    try {
      await deleteElectrodeMaterial(deletingId, isHardDelete);
      loadMaterials(includeZeroStock);
      setShowDeleteModal(false);
      setDeletingId(null);
    } catch (err) {
      console.error('자재 삭제 실패:', err);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingId(null);
  };

  useEffect(() => {
    loadMaterials(includeZeroStock);
  }, []);

  if (loading) return <p>데이터를 불러오는 중...</p>;

  return (
    <div className={styles.electrodeList}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>전극 자재 목록</h2>
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
        </div>
        {!showHistory && (
          <button className={styles.addButton} onClick={handleOpenModal}>
            + 추가
          </button>
        )}
      </div>

      {!showHistory ? (
        error ? (
          <p style={{ color: 'red', padding: '20px' }}>데이터 조회 실패</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.electrodeTable}>
              <thead>
                <tr>
                  <th>
                    자재
                    <br />
                    (중분류)
                  </th>
                  <th>
                    종류
                    <br />
                    (소분류)
                  </th>
                  <th>용도</th>
                  <th>제품명</th>
                  <th>규격</th>
                  <th>Lot No.</th>
                  <th>
                    제조
                    <br />
                    공급처
                  </th>
                  <th>
                    국내
                    <br />외
                  </th>
                  <th>단위</th>
                  <th>가격</th>
                  <th>비고</th>
                  <th>재고</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(material => (
                  <tr key={material.id}>
                    <td>{material.category}</td>
                    <td>{material.type}</td>
                    <td>{material.purpose}</td>
                    <td>{material.name}</td>
                    <td className={styles.specCell}>
                      <span title={material.spec} className={styles.specText}>
                        {material.spec}
                      </span>
                    </td>
                    <td>{material.lotNo}</td>
                    <td>{material.company}</td>
                    <td className={styles.domesticCell}>{material.origin}</td>
                    <td>{material.unit}</td>
                    <td className={styles.priceCell}>{Math.floor(material.price ?? 0).toLocaleString('ko-KR')}</td>
                    <td>{material.note}</td>
                    <td className={styles.inventoryCell}>{material.stock}</td>
                    <td className={styles.managementCell}>
                      <button className={styles.editButton} onClick={() => handleEditMaterial(material)}>
                        수정
                      </button>
                      <button className={styles.deleteButton} onClick={() => handleDeleteMaterial(material.id)}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.historyTable}>
            <thead>
              <tr>
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
                  <tr key={history.id}>
                    <td>{new Date(history.createdAt).toLocaleString('ko-KR')}</td>
                    <td>{history.material?.name || '-'}</td>
                    <td>{history.material?.lotNo || '-'}</td>
                    <td>
                      {history.previousStock} → {history.currentStock}
                    </td>
                    <td>{history.type || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyMessage}>
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
        </div>
      )}

      <AddMaterialModal
        show={showModal}
        isEditing={editingId !== null}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      <DeleteMaterialModal show={showDeleteModal} onConfirm={handleDeleteConfirm} onClose={handleCloseDeleteModal} />
    </div>
  );
}
