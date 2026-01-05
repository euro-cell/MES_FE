import { useEffect, useState } from 'react';
import { getElectrodeMaterials } from './service';
import type { ElectrodeMaterial } from './types';
import styles from '../../../../styles/stock/material/electrode.module.css';

export default function ElectrodeList() {
  const [materials, setMaterials] = useState<ElectrodeMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMaterials = async () => {
    try {
      const data = await getElectrodeMaterials();
      setMaterials(data);
    } catch (err) {
      console.error('❌ 전극 자재 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  if (loading) return <p>데이터를 불러오는 중...</p>;

  return (
    <div className={styles.electrodeList}>
      <div className={styles.header}>
        <h2>전극 자재 목록</h2>
        <button className={styles.addButton}>+ 자재 추가</button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.electrodeTable}>
          <thead>
            <tr>
              <th>자재<br />(중분류)</th>
              <th>종류<br />(소분류)</th>
              <th>용도</th>
              <th>제품명</th>
              <th>스펙</th>
              <th>Lot No.</th>
              <th>제조<br />공급처</th>
              <th>국내<br />외</th>
              <th>단위</th>
              <th>가격</th>
              <th>비고</th>
              <th>재고</th>
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
                <td className={styles.priceCell}>{(material.price ?? 0).toLocaleString()}</td>
                <td>{material.note}</td>
                <td className={styles.inventoryCell}>{material.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
