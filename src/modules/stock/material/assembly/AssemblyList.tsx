import { useEffect, useState } from 'react';
import {
  getAssemblyMaterials,
  createAssemblyMaterial,
  updateAssemblyMaterial,
  deleteAssemblyMaterial,
} from './service';
import type { AssemblyMaterial } from './types';
import AddAssemblyModal from './AddAssemblyModal';
import DeleteAssemblyModal from './DeleteAssemblyModal';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [includeZeroStock, setIncludeZeroStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<AssemblyMaterial, 'id'>>(INITIAL_FORM_DATA);

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
      await deleteAssemblyMaterial(deletingId, isHardDelete);
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
    <div className={styles.assemblyList}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>조립 자재 목록</h2>
          <label className={styles.checkboxLabel}>
            <input
              type='checkbox'
              checked={includeZeroStock}
              onChange={handleIncludeZeroStockChange}
              className={styles.checkbox}
            />
            <span>재고가 없는 자재도 포함</span>
          </label>
        </div>
        <button className={styles.addButton} onClick={handleOpenModal}>
          + 추가
        </button>
      </div>

      {error ? (
        <p style={{ color: 'red', padding: '20px' }}>데이터 조회 실패</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.assemblyTable}>
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
                <th>스펙</th>
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
    </div>
  );
}
