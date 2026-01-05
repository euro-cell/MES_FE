import { useEffect, useState } from 'react';
import { getElectrodeMaterials, createElectrodeMaterial, updateElectrodeMaterial } from './service';
import type { ElectrodeMaterial } from './types';
import AddMaterialModal from './AddMaterialModal';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [includeZeroStock, setIncludeZeroStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<ElectrodeMaterial, 'id'>>(INITIAL_FORM_DATA);

  const loadMaterials = async (includeZero: boolean = false) => {
    try {
      // 백엔드에 파라미터 전달 (서버 사이드 필터링)
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
        // 수정 모드
        await updateElectrodeMaterial(editingId, formData);
      } else {
        // 추가 모드
        await createElectrodeMaterial(formData);
      }
      // 성공 후 목록 새로고침
      loadMaterials(includeZeroStock);
      handleCloseModal();
    } catch (err) {
      console.error('자재 처리 실패:', err);
    }
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}
