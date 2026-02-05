import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';
import type { CathodeMaterial1Data } from '../IQCTypes';

interface CathodeMaterial1TableProps {
  data?: CathodeMaterial1Data;
  productionId: number;
  onSave?: (data: Partial<CathodeMaterial1Data>) => Promise<void>;
}

const CathodeMaterial1Table: React.FC<CathodeMaterial1TableProps> = ({
  data,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // 기본 검사 항목 템플릿
  const getDefaultInspectionResults = () => [
    { item: '입도', subItem: 'D5', standard: '', result: '', pass: true },
    { item: '입도', subItem: 'D50', standard: '', result: '', pass: true },
    { item: '입도', subItem: 'D95', standard: '', result: '', pass: true },
    { item: '수분', standard: '', result: '', pass: true },
    { item: '탭밀도', standard: '', result: '', pass: true },
    { item: 'pH', standard: '', result: '', pass: true },
    { item: 'Half cell', subItem: '0.1C', standard: '', result: '', pass: true },
    { item: 'Half cell', subItem: '1st 효율', standard: '', result: '', pass: true },
    { item: 'Half cell', subItem: '0.5C', standard: '', result: '', pass: true },
    { item: 'Half cell', subItem: '1.0C', standard: '', result: '', pass: true },
  ];

  const [editData, setEditData] = useState<CathodeMaterial1Data>({
    id: 0,
    inspectionDate: new Date().toISOString().split('T')[0],
    lot: '',
    manufacturer: '',
    inspectionResults: getDefaultInspectionResults(),
    coaReference: '',
    images: [],
    remarks: '',
  });

  useEffect(() => {
    if (data) {
      setEditData(data);
    } else {
      // 데이터가 없을 때 기본 템플릿 사용
      setEditData({
        id: 0,
        inspectionDate: new Date().toISOString().split('T')[0],
        lot: '',
        manufacturer: '',
        inspectionResults: getDefaultInspectionResults(),
        coaReference: '',
        images: [],
        remarks: '',
      });
    }
  }, [data]);

  const handleSave = async () => {
    if (onSave) {
      await onSave(editData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (data) {
      setEditData(data);
    }
    setIsEditing(false);
  };

  return (
    <div className={styles.tableContainer}>
      {/* 기본 정보 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>양극재1 검사</h3>
          <div>
            {!isEditing ? (
              <button className={styles.specButton} onClick={() => setIsEditing(true)}>
                {data ? '수정' : '등록'}
              </button>
            ) : (
              <>
                <button className={styles.saveButton} onClick={handleSave} style={{ marginRight: '8px' }}>
                  저장
                </button>
                <button className={styles.cancelButton} onClick={handleCancel}>
                  취소
                </button>
              </>
            )}
          </div>
        </div>
        <table className={styles.iqcTable}>
          <tbody>
            <tr>
              <th style={{ width: '150px' }}>검사일</th>
              <td>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.inspectionDate}
                    onChange={(e) => setEditData({ ...editData, inspectionDate: e.target.value })}
                    style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                  />
                ) : (
                  editData.inspectionDate
                )}
              </td>
              <th style={{ width: '150px' }}>Lot</th>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.lot}
                    onChange={(e) => setEditData({ ...editData, lot: e.target.value })}
                    style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                  />
                ) : (
                  editData.lot
                )}
              </td>
            </tr>
            <tr>
              <th>제조사</th>
              <td colSpan={3}>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.manufacturer}
                    onChange={(e) => setEditData({ ...editData, manufacturer: e.target.value })}
                    style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                  />
                ) : (
                  editData.manufacturer
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 검사 결과 */}
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>검사 결과</h3>
          {isEditing && (
            <button
              className={styles.specButton}
              onClick={() => {
                setEditData({
                  ...editData,
                  inspectionResults: [
                    ...editData.inspectionResults,
                    { item: '', standard: '', result: '', pass: true },
                  ],
                });
              }}
            >
              항목 추가
            </button>
          )}
        </div>
        <table className={styles.iqcTable}>
          <thead>
            <tr>
              <th colSpan={2} style={{ width: '270px' }}>검사 항목</th>
              <th>기준</th>
              <th style={{ width: '150px' }}>결과</th>
              <th style={{ width: '100px' }}>합부판정</th>
              {isEditing && <th style={{ width: '80px' }}>삭제</th>}
            </tr>
          </thead>
          <tbody>
            {editData.inspectionResults && editData.inspectionResults.length > 0 ? (
              (() => {
                const rows: React.JSX.Element[] = [];
                let i = 0;

                while (i < editData.inspectionResults.length) {
                  const current = editData.inspectionResults[i];

                  // 같은 항목의 세부 항목들을 찾기
                  const subItems = [current];
                  let j = i + 1;
                  while (j < editData.inspectionResults.length &&
                         editData.inspectionResults[j].item === current.item &&
                         editData.inspectionResults[j].subItem) {
                    subItems.push(editData.inspectionResults[j]);
                    j++;
                  }

                  // 세부 항목이 있는 경우
                  if (subItems.length > 1 || current.subItem) {
                    subItems.forEach((result, subIndex) => {
                      const actualIndex = i + subIndex;
                      rows.push(
                        <tr key={actualIndex}>
                          {subIndex === 0 && (
                            <td rowSpan={subItems.length}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={result.item}
                                  onChange={(e) => {
                                    const updated = [...editData.inspectionResults];
                                    // 모든 서브 아이템의 항목명을 변경
                                    for (let k = 0; k < subItems.length; k++) {
                                      updated[i + k].item = e.target.value;
                                    }
                                    setEditData({ ...editData, inspectionResults: updated });
                                  }}
                                  style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                                />
                              ) : (
                                result.item
                              )}
                            </td>
                          )}
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                value={result.subItem || ''}
                                onChange={(e) => {
                                  const updated = [...editData.inspectionResults];
                                  updated[actualIndex].subItem = e.target.value;
                                  setEditData({ ...editData, inspectionResults: updated });
                                }}
                                style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                              />
                            ) : (
                              result.subItem || ''
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                value={result.standard}
                                onChange={(e) => {
                                  const updated = [...editData.inspectionResults];
                                  updated[actualIndex].standard = e.target.value;
                                  setEditData({ ...editData, inspectionResults: updated });
                                }}
                                style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                              />
                            ) : (
                              result.standard
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                value={result.result}
                                onChange={(e) => {
                                  const updated = [...editData.inspectionResults];
                                  updated[actualIndex].result = e.target.value;
                                  setEditData({ ...editData, inspectionResults: updated });
                                }}
                                style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                              />
                            ) : (
                              result.result
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <select
                                value={result.pass ? 'true' : 'false'}
                                onChange={(e) => {
                                  const updated = [...editData.inspectionResults];
                                  updated[actualIndex].pass = e.target.value === 'true';
                                  setEditData({ ...editData, inspectionResults: updated });
                                }}
                                style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                              >
                                <option value="true">합격</option>
                                <option value="false">불합격</option>
                              </select>
                            ) : (
                              <span
                                style={{
                                  color: result.pass ? '#16a34a' : '#dc2626',
                                  fontWeight: 600,
                                }}
                              >
                                {result.pass ? '합격' : '불합격'}
                              </span>
                            )}
                          </td>
                          {isEditing && (
                            <td>
                              <button
                                className={styles.deleteButton}
                                onClick={() => {
                                  const updated = editData.inspectionResults.filter((_, idx) => idx !== actualIndex);
                                  setEditData({ ...editData, inspectionResults: updated });
                                }}
                              >
                                삭제
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    });
                    i = j;
                  } else {
                    // 세부 항목이 없는 경우 (colspan)
                    rows.push(
                      <tr key={i}>
                        <td colSpan={2}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={current.item}
                              onChange={(e) => {
                                const updated = [...editData.inspectionResults];
                                updated[i].item = e.target.value;
                                setEditData({ ...editData, inspectionResults: updated });
                              }}
                              style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            />
                          ) : (
                            current.item
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={current.standard}
                              onChange={(e) => {
                                const updated = [...editData.inspectionResults];
                                updated[i].standard = e.target.value;
                                setEditData({ ...editData, inspectionResults: updated });
                              }}
                              style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            />
                          ) : (
                            current.standard
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={current.result}
                              onChange={(e) => {
                                const updated = [...editData.inspectionResults];
                                updated[i].result = e.target.value;
                                setEditData({ ...editData, inspectionResults: updated });
                              }}
                              style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            />
                          ) : (
                            current.result
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              value={current.pass ? 'true' : 'false'}
                              onChange={(e) => {
                                const updated = [...editData.inspectionResults];
                                updated[i].pass = e.target.value === 'true';
                                setEditData({ ...editData, inspectionResults: updated });
                              }}
                              style={{ width: '100%', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                            >
                              <option value="true">합격</option>
                              <option value="false">불합격</option>
                            </select>
                          ) : (
                            <span
                              style={{
                                color: current.pass ? '#16a34a' : '#dc2626',
                                fontWeight: 600,
                              }}
                            >
                              {current.pass ? '합격' : '불합격'}
                            </span>
                          )}
                        </td>
                        {isEditing && (
                          <td>
                            <button
                              className={styles.deleteButton}
                              onClick={() => {
                                const updated = editData.inspectionResults.filter((_, idx) => idx !== i);
                                setEditData({ ...editData, inspectionResults: updated });
                              }}
                            >
                              삭제
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                    i++;
                  }
                }

                return rows;
              })()
            ) : (
              <tr>
                <td colSpan={isEditing ? 6 : 5} className={styles.noDataRow}>
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
                  value={editData.coaReference || ''}
                  onChange={(e) => setEditData({ ...editData, coaReference: e.target.value })}
                  readOnly={!isEditing}
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
                {editData.images && editData.images.length > 0 ? (
                  <div className={styles.imageContainer}>
                    {editData.images.map((img, index) => (
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
                  value={editData.remarks || ''}
                  onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                  readOnly={!isEditing}
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

export default CathodeMaterial1Table;
