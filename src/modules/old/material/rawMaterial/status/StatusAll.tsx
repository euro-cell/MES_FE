import { useEffect, useState } from 'react';
import styles from '../../../../../styles/material/rawMaterial.module.css';
import { fetchAllMaterials } from './StatusService';

interface Material {
  id: number;
  process: string;
  category: string;
  type: string;
  purpose: string;
  name: string;
  lotNo: string | null;
  company: string | null;
  origin: string;
  unit: string;
  price: number | null;
  note: string | null;
  stock: number | null;
}

export default function StatusAll() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchAllMaterials();
        setMaterials(data);
      } catch (err) {
        console.error('자재 목록 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className={styles.statusAll}>
      <h4>📊 전체 자재 현황 (전극 + 조립)</h4>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <table className={styles.rawDetailTable}>
          <thead>
            <tr>
              <th>No.</th>
              <th>공정</th>
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
              <th>Lot No.</th>
              <th>제조/공급처</th>
              <th>국내/외</th>
              <th>단위</th>
              <th>가격</th>
              <th>비고</th>
              <th>재고</th>
            </tr>
          </thead>
          <tbody>
            {materials.length > 0 ? (
              materials.map((row, i) => (
                <tr key={row.id}>
                  <td>{i + 1}</td>
                  <td>{row.process}</td>
                  <td>{row.category}</td>
                  <td>{row.type}</td>
                  <td>{row.purpose}</td>
                  <td>{row.name}</td>
                  <td>{row.lotNo || '-'}</td>
                  <td>{row.company || '-'}</td>
                  <td>{row.origin}</td>
                  <td>{row.unit.toUpperCase()}</td>
                  <td>{row.price != null ? `₩ ${Math.floor(Number(row.price)).toLocaleString()}` : '-'}</td>
                  <td>{row.note || '-'}</td>
                  <td>{row.stock ?? '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13}>등록된 자재가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
