import React from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';
import type { AnodeMaterialData } from '../IQCTypes';

interface AnodeMaterialTableProps {
  data?: AnodeMaterialData;
}

const AnodeMaterialTable: React.FC<AnodeMaterialTableProps> = ({ data }) => {
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
          <h3 className={styles.tableTitle}>음극재 (LTO) 검사</h3>
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

      {/* PSD raw data */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>PSD raw data</h3>
        </div>
        <table className={styles.iqcTable}>
          <tbody>
            <tr>
              <td className={styles.textCell}>
                <textarea
                  className={styles.textArea}
                  value={data.psdRawData || ''}
                  readOnly
                  placeholder="PSD raw data 없음"
                  style={{ minHeight: '120px' }}
                />
              </td>
            </tr>
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

      {/* 이미지 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>이미지</h3>
        </div>
        <table className={styles.iqcTable}>
          <tbody>
            <tr>
              <td className={styles.imageCell}>
                {data.images && data.images.length > 0 ? (
                  <div className={styles.imageContainer}>
                    {data.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`검사 이미지 ${index + 1}`}
                        className={styles.imagePreview}
                      />
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8' }}>
                    등록된 이미지가 없습니다.
                  </span>
                )}
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

export default AnodeMaterialTable;
