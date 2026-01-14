import { useState } from 'react';
import styles from '../../../styles/draw/DrawingLedger.module.css';
import { MOCK_DRAWING_LEDGER } from './DrawingLedgerMockData';
import type { DrawingCategory } from './DrawingLedgerTypes';

const CATEGORIES: DrawingCategory[] = ['공장', '설비', '제품', 'OEM/ODM'];

export default function DrawingLedgerPage() {
  const [filterCategory, setFilterCategory] = useState<DrawingCategory | ''>('');

  const filteredData = filterCategory
    ? MOCK_DRAWING_LEDGER.filter(item => item.category === filterCategory)
    : MOCK_DRAWING_LEDGER;

  const formatDate = (dateStr: string) => {
    if (dateStr.length === 6) {
      const yy = dateStr.slice(0, 2);
      const mm = dateStr.slice(2, 4);
      const dd = dateStr.slice(4, 6);
      const year = Number(yy) > 50 ? `19${yy}` : `20${yy}`;
      return `${year}-${mm}-${dd}`;
    }
    return dateStr;
  };

  return (
    <div className={styles.ledgerPage}>
      <div className={styles.header}>
        <h3>도면 관리 대장</h3>
        <div className={styles.filterSection}>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as DrawingCategory | '')}
            className={styles.filterSelect}
          >
            <option value="">전체</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <table className={styles.ledgerTable}>
        <thead>
          <tr>
            <th>No.</th>
            <th>도면 구분</th>
            <th>등록일자</th>
            <th>프로젝트명 (공장명/제품명/설비명)</th>
            <th>도면 번호</th>
            <th>Version</th>
            <th>도면 내용</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>
                <span className={`${styles.categoryBadge} ${styles[item.category.replace('/', '')]}`}>
                  {item.category}
                </span>
              </td>
              <td>{formatDate(item.registeredDate)}</td>
              <td>{item.projectName}</td>
              <td>{item.drawingNo}</td>
              <td>{item.version}</td>
              <td>{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
