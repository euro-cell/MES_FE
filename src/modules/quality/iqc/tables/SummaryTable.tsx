import React from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';
import type { IQCItem } from '../IQCTypes';

interface SummaryTableProps {
  items: IQCItem[];
}

const CATEGORY_LABELS: { key: string; label: string }[] = [
  { key: '양극재', label: '양극재' },
  { key: '음극재', label: '음극재' },
  { key: '도전재', label: '도전재' },
  { key: '집전체', label: '집전체' },
  { key: '분리막', label: '분리막' },
  { key: '전해액', label: '전해액' },
  { key: '파우치', label: '파우치' },
  { key: '리드탭', label: '리드탭' },
];

const SummaryTable: React.FC<SummaryTableProps> = ({ items }) => {
  // category별 부적합 건수 집계
  const nonConformityCounts = CATEGORY_LABELS.reduce<Record<string, number>>((acc, { key }) => {
    acc[key] = items.filter((item) => item.category === key && item.isPassed === false).length;
    return acc;
  }, {});

  return (
    <div className={styles.tableContainer}>
      {/* 부적합 구분 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>반제품 품질 부적합 구분</h3>
        </div>
        <div className={styles.nonConformityGrid}>
          {CATEGORY_LABELS.map(({ key, label }) => (
            <div key={key} className={styles.nonConformityItem}>
              <span className={styles.nonConformityLabel}>{label}:</span>
              <span className={styles.nonConformityValue}>{nonConformityCounts[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* IQC List */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>IQC List</h3>
        </div>
        <table className={styles.iqcTable}>
          <colgroup>
            <col style={{ width: '60px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '120px' }} />
            <col />
            <col style={{ width: '120px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '120px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No</th>
              <th>구분</th>
              <th>품목</th>
              <th>품명</th>
              <th>Lot No.</th>
              <th>검사자</th>
              <th>검사일</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.category}</td>
                  <td>{item.type}</td>
                  <td style={{ textAlign: 'left' }}>{item.name}</td>
                  <td>{item.lotNo || '-'}</td>
                  <td>{item.inspector || '-'}</td>
                  <td>{item.inspectionDate || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.noDataRow}>
                  검사 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryTable;
