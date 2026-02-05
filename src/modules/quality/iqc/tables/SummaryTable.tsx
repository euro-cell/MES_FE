import React from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';
import type { IQCSummary } from '../IQCTypes';

interface SummaryTableProps {
  data?: IQCSummary;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data }) => {
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
      {/* 프로젝트 개요 및 반제품 품질 부적합 구분 */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardTitle}>프로젝트 개요</div>
          <div className={styles.summaryCardContent}>
            {data.projectOverview || '-'}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardTitle}>
            반제품 품질 부적합 구분
          </div>
          <div className={styles.nonConformityGrid}>
            <div className={styles.nonConformityItem}>
              <span className={styles.nonConformityLabel}>양극재:</span>
              <span className={styles.nonConformityValue}>
                {data.nonConformity.cathodeMaterial}
              </span>
            </div>
            <div className={styles.nonConformityItem}>
              <span className={styles.nonConformityLabel}>음극재:</span>
              <span className={styles.nonConformityValue}>
                {data.nonConformity.anodeMaterial}
              </span>
            </div>
            <div className={styles.nonConformityItem}>
              <span className={styles.nonConformityLabel}>도전재:</span>
              <span className={styles.nonConformityValue}>
                {data.nonConformity.conductiveMaterial}
              </span>
            </div>
            <div className={styles.nonConformityItem}>
              <span className={styles.nonConformityLabel}>집전체:</span>
              <span className={styles.nonConformityValue}>
                {data.nonConformity.currentCollector}
              </span>
            </div>
            <div className={styles.nonConformityItem}>
              <span className={styles.nonConformityLabel}>분리막:</span>
              <span className={styles.nonConformityValue}>
                {data.nonConformity.separator}
              </span>
            </div>
            <div className={styles.nonConformityItem}>
              <span className={styles.nonConformityLabel}>전해액:</span>
              <span className={styles.nonConformityValue}>
                {data.nonConformity.electrolyte}
              </span>
            </div>
            <div className={styles.nonConformityItem}>
              <span className={styles.nonConformityLabel}>파우치:</span>
              <span className={styles.nonConformityValue}>
                {data.nonConformity.pouch}
              </span>
            </div>
            <div className={styles.nonConformityItem}>
              <span className={styles.nonConformityLabel}>리드탭:</span>
              <span className={styles.nonConformityValue}>
                {data.nonConformity.leadTab}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 특이사항 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>특이사항</h3>
        </div>
        <div className={styles.textCell}>
          <textarea
            className={styles.textArea}
            value={data.remarks || ''}
            readOnly
            placeholder="특이사항 없음"
          />
        </div>
      </div>

      {/* IQC List */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>IQC List</h3>
        </div>
        <table className={styles.iqcTable}>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>No</th>
              <th style={{ width: '150px' }}>구분</th>
              <th>기준</th>
              <th style={{ width: '120px' }}>결과</th>
              <th style={{ width: '100px' }}>검사자</th>
              <th style={{ width: '120px' }}>검사일</th>
            </tr>
          </thead>
          <tbody>
            {data.iqcList && data.iqcList.length > 0 ? (
              data.iqcList.map((item) => (
                <tr key={item.no}>
                  <td>{item.no}</td>
                  <td>{item.category}</td>
                  <td style={{ textAlign: 'left' }}>{item.standard}</td>
                  <td>{item.result}</td>
                  <td>{item.inspector}</td>
                  <td>{item.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.noDataRow}>
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
