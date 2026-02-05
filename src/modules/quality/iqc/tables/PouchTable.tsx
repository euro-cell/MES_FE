import React from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';
import type { PouchData } from '../IQCTypes';

interface PouchTableProps {
  data?: PouchData;
}

const PouchTable: React.FC<PouchTableProps> = ({ data }) => {
  if (!data) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableSection}>
          <p className={styles.noDataRow}>데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      {/* 기본 정보 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>파우치 (Al-Pouch) 검사</h3>
        </div>
        <table className={styles.iqcTable}>
          <tbody>
            <tr>
              <th style={{ width: '150px' }}>검사일</th>
              <td>{data.inspectionDate}</td>
              <th style={{ width: '150px' }}>Lot</th>
              <td>{data.lot}</td>
            </tr>
            <tr>
              <th>제조사</th>
              <td colSpan={3}>{data.manufacturer}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 검사 결과 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>검사 결과</h3>
        </div>
        <table className={styles.iqcTable}>
          <thead>
            <tr>
              <th style={{ width: '200px' }}>항목</th>
              <th>기준</th>
              <th style={{ width: '150px' }}>결과</th>
              <th style={{ width: '100px' }}>합부판정</th>
            </tr>
          </thead>
          <tbody>
            {data.inspectionResults && data.inspectionResults.length > 0 ? (
              data.inspectionResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.item}</td>
                  <td>{result.standard}</td>
                  <td>{result.result}</td>
                  <td
                    style={{
                      color: result.pass ? '#16a34a' : '#dc2626',
                      fontWeight: 600,
                    }}
                  >
                    {result.pass ? '합격' : '불합격'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className={styles.noDataRow}>
                  검사 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CoA 참조 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>CoA 참조</h3>
        </div>
        <table className={styles.iqcTable}>
          <tbody>
            <tr>
              <td className={styles.textCell}>
                <textarea
                  className={styles.textArea}
                  value={data.coaReference || ''}
                  readOnly
                  placeholder="CoA 참조 정보 없음"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 비고 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>비고</h3>
        </div>
        <table className={styles.iqcTable}>
          <tbody>
            <tr>
              <td className={styles.textCell}>
                <textarea
                  className={styles.textArea}
                  value={data.remarks || ''}
                  readOnly
                  placeholder="비고 없음"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PouchTable;
