import React, { useState, useEffect } from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';
import type { CathodeMaterial1Data, CathodeMaterial1Result, CathodeMaterial1CoaResult } from '../IQCTypes';

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
  const getDefaultInspectionResults = (): CathodeMaterial1Result[] => [
    { item: '입도', subItem: 'D5', unit: 'μm', standard: 'N/A', refCoa: '', refLastData: '', sample1: '', sample2: '', sample3: '', average: '', pass: true, remarks: '' },
    { item: '입도', subItem: 'D50', unit: 'μm', standard: '', refCoa: '', refLastData: '', sample1: '', sample2: '', sample3: '', average: '', pass: true, remarks: '' },
    { item: '입도', subItem: 'D95', unit: 'μm', standard: 'N/A', refCoa: '', refLastData: '', sample1: '', sample2: '', sample3: '', average: '', pass: true, remarks: '' },
    { item: '수분', unit: 'ppm', standard: 'TBD', refCoa: '', refLastData: '', sample1: '', sample2: '', sample3: '', average: '', pass: true, remarks: '' },
    { item: '탭밀도', unit: 'g/cc', standard: '', refCoa: '', refLastData: '', sample1: '', sample2: '', sample3: '', average: '', pass: true, remarks: '' },
    { item: 'pH', unit: '', standard: 'N/A', refCoa: 'N/A', refLastData: '', sample1: '', sample2: '', sample3: '', average: '', pass: true, remarks: '' },
    { item: 'Half cell', subItem: '0.1C', unit: 'mAh/g', standard: '', refCoa: '', refLastData: '', sample1: '', sample2: '', sample3: '', average: '', pass: true, remarks: '' },
    { item: 'Half cell', subItem: '1st 효율', unit: '%', standard: '', refCoa: '', refLastData: '', sample1: '', sample2: '', sample3: '', average: '', pass: null, remarks: '' },
    { item: 'Half cell', subItem: '0.5C', unit: 'mAh/g', standard: 'TBD', refCoa: 'N/A', refLastData: '', sample1: '', sample2: '', sample3: '', average: '', pass: null, remarks: '' },
    { item: 'Half cell', subItem: '1.0C', unit: 'mAh/g', standard: 'TBD', refCoa: 'N/A', refLastData: '', sample1: '', sample2: '', sample3: '', average: '', pass: true, remarks: '' },
  ];

  const getDefaultCoaResults = (): CathodeMaterial1CoaResult => ({
    dMin: '',
    dMax: '',
    bet: '',
    lioh: '',
    li2co3: '',
    fe: '',
  });

  const [editData, setEditData] = useState<CathodeMaterial1Data>({
    id: 0,
    productCode: '',
    productName: '',
    manufacturer: '',
    lotNo: '',
    usage: '',
    receiveDate: '',
    inspectionDate: '',
    inspector: '',
    inspectionResults: getDefaultInspectionResults(),
    coaResults: getDefaultCoaResults(),
    images: {},
    remarks: '',
  });

  useEffect(() => {
    if (data) {
      setEditData(data);
    } else {
      setEditData({
        id: 0,
        productCode: '',
        productName: '',
        manufacturer: '',
        lotNo: '',
        usage: '',
        receiveDate: '',
        inspectionDate: '',
        inspector: '',
        inspectionResults: getDefaultInspectionResults(),
        coaResults: getDefaultCoaResults(),
        images: {},
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

  // 검사 결과 행 렌더링
  const renderInspectionRows = () => {
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
                <td rowSpan={subItems.length} className={styles.itemCell}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={result.item}
                      onChange={(e) => {
                        const updated = [...editData.inspectionResults];
                        for (let k = 0; k < subItems.length; k++) {
                          updated[i + k].item = e.target.value;
                        }
                        setEditData({ ...editData, inspectionResults: updated });
                      }}
                      className={styles.tableInput}
                    />
                  ) : (
                    result.item
                  )}
                </td>
              )}
              <td className={styles.subItemCell}>
                {isEditing ? (
                  <input
                    type="text"
                    value={result.subItem || ''}
                    onChange={(e) => {
                      const updated = [...editData.inspectionResults];
                      updated[actualIndex].subItem = e.target.value;
                      setEditData({ ...editData, inspectionResults: updated });
                    }}
                    className={styles.tableInput}
                  />
                ) : (
                  result.subItem || ''
                )}
              </td>
              {renderResultCells(result, actualIndex)}
            </tr>
          );
        });
        i = j;
      } else {
        // 세부 항목이 없는 경우
        rows.push(
          <tr key={i}>
            <td colSpan={2} className={styles.itemCell}>
              {isEditing ? (
                <input
                  type="text"
                  value={current.item}
                  onChange={(e) => {
                    const updated = [...editData.inspectionResults];
                    updated[i].item = e.target.value;
                    setEditData({ ...editData, inspectionResults: updated });
                  }}
                  className={styles.tableInput}
                />
              ) : (
                current.item
              )}
            </td>
            {renderResultCells(current, i)}
          </tr>
        );
        i++;
      }
    }

    return rows;
  };

  // 결과 셀 렌더링
  const renderResultCells = (result: CathodeMaterial1Result, index: number) => {
    const updateField = (field: keyof CathodeMaterial1Result, value: string | boolean | null) => {
      const updated = [...editData.inspectionResults];
      (updated[index] as any)[field] = value;
      setEditData({ ...editData, inspectionResults: updated });
    };

    const getPassDisplay = (pass: boolean | null) => {
      if (pass === null) return { text: '불', color: '#dc2626' };
      return pass ? { text: '합', color: '#16a34a' } : { text: '불', color: '#dc2626' };
    };

    const passDisplay = getPassDisplay(result.pass);

    return (
      <>
        <td>{isEditing ? <input type="text" value={result.unit} onChange={(e) => updateField('unit', e.target.value)} className={styles.tableInput} /> : result.unit}</td>
        <td>{isEditing ? <input type="text" value={result.standard} onChange={(e) => updateField('standard', e.target.value)} className={styles.tableInput} /> : result.standard}</td>
        <td>{isEditing ? <input type="text" value={result.refCoa} onChange={(e) => updateField('refCoa', e.target.value)} className={styles.tableInput} /> : result.refCoa}</td>
        <td>{isEditing ? <input type="text" value={result.refLastData} onChange={(e) => updateField('refLastData', e.target.value)} className={styles.tableInput} /> : result.refLastData}</td>
        <td>{isEditing ? <input type="text" value={result.sample1} onChange={(e) => updateField('sample1', e.target.value)} className={styles.tableInput} /> : result.sample1}</td>
        <td>{isEditing ? <input type="text" value={result.sample2} onChange={(e) => updateField('sample2', e.target.value)} className={styles.tableInput} /> : result.sample2}</td>
        <td>{isEditing ? <input type="text" value={result.sample3} onChange={(e) => updateField('sample3', e.target.value)} className={styles.tableInput} /> : result.sample3}</td>
        <td>{isEditing ? <input type="text" value={result.average} onChange={(e) => updateField('average', e.target.value)} className={styles.tableInput} /> : result.average}</td>
        <td className={styles.passCell} style={{ color: passDisplay.color, fontWeight: 600 }}>
          {isEditing ? (
            <select
              value={result.pass === null ? 'null' : result.pass ? 'true' : 'false'}
              onChange={(e) => {
                const val = e.target.value;
                updateField('pass', val === 'null' ? null : val === 'true');
              }}
              className={styles.tableSelect}
            >
              <option value="true">합</option>
              <option value="false">불</option>
            </select>
          ) : (
            passDisplay.text
          )}
        </td>
        <td>{isEditing ? <input type="text" value={result.remarks} onChange={(e) => updateField('remarks', e.target.value)} className={styles.tableInput} /> : result.remarks}</td>
      </>
    );
  };

  return (
    <div className={styles.tableContainer}>
      {/* 타이틀 및 버튼 */}
      <div className={styles.tableTitleRow}>
        <h3 className={styles.tableTitle}>■ 수입검사 결과</h3>
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

      {/* 기본 정보 테이블 */}
      <table className={styles.iqcTable}>
        <colgroup>
          <col style={{ width: '12%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '8%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>품목</th>
            <th>품명</th>
            <th>제조원</th>
            <th>Lot no.</th>
            <th>사용처</th>
            <th>입고일</th>
            <th>검사일</th>
            <th>검사자</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{isEditing ? <input type="text" value={editData.productCode} onChange={(e) => setEditData({ ...editData, productCode: e.target.value })} className={styles.tableInput} /> : editData.productCode}</td>
            <td>{isEditing ? <input type="text" value={editData.productName} onChange={(e) => setEditData({ ...editData, productName: e.target.value })} className={styles.tableInput} /> : editData.productName}</td>
            <td>{isEditing ? <input type="text" value={editData.manufacturer} onChange={(e) => setEditData({ ...editData, manufacturer: e.target.value })} className={styles.tableInput} /> : editData.manufacturer}</td>
            <td>{isEditing ? <input type="text" value={editData.lotNo} onChange={(e) => setEditData({ ...editData, lotNo: e.target.value })} className={styles.tableInput} /> : editData.lotNo}</td>
            <td>{isEditing ? <input type="text" value={editData.usage} onChange={(e) => setEditData({ ...editData, usage: e.target.value })} className={styles.tableInput} /> : editData.usage}</td>
            <td>{isEditing ? <input type="date" value={editData.receiveDate} onChange={(e) => setEditData({ ...editData, receiveDate: e.target.value })} className={styles.tableInput} /> : editData.receiveDate}</td>
            <td>{isEditing ? <input type="date" value={editData.inspectionDate} onChange={(e) => setEditData({ ...editData, inspectionDate: e.target.value })} className={styles.tableInput} /> : editData.inspectionDate}</td>
            <td>{isEditing ? <input type="text" value={editData.inspector} onChange={(e) => setEditData({ ...editData, inspector: e.target.value })} className={styles.tableInput} /> : editData.inspector}</td>
          </tr>
        </tbody>
      </table>

      {/* 검사 결과 테이블 */}
      <table className={styles.iqcTable} style={{ marginTop: '-1px' }}>
        <colgroup>
          <col style={{ width: '8%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '8%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '11%' }} />
        </colgroup>
        <thead>
          <tr>
            <th colSpan={2} rowSpan={2}>검사 항목</th>
            <th rowSpan={2}>단위</th>
            <th rowSpan={2}>규격</th>
            <th colSpan={2}>Reference</th>
            <th colSpan={4}>검사 결과</th>
            <th rowSpan={2}>합불판정</th>
            <th rowSpan={2}>비고</th>
          </tr>
          <tr>
            <th>CoA</th>
            <th>Last data</th>
            <th>샘플1</th>
            <th>샘플2</th>
            <th>샘플3</th>
            <th>평균</th>
          </tr>
        </thead>
        <tbody>
          {renderInspectionRows()}
        </tbody>
      </table>

      {/* 기타 CoA 참조 결과 */}
      <div className={styles.tableTitleRow} style={{ marginTop: '16px' }}>
        <h3 className={styles.tableTitle}>■ 기타 CoA 참조 결과</h3>
        <span className={styles.noteText}>※ 부적합</span>
      </div>
      <table className={styles.iqcTable}>
        <colgroup>
          <col style={{ width: '16.66%' }} />
          <col style={{ width: '16.66%' }} />
          <col style={{ width: '16.66%' }} />
          <col style={{ width: '16.66%' }} />
          <col style={{ width: '16.66%' }} />
          <col style={{ width: '16.7%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>D<sub>min</sub>(μm)</th>
            <th>D<sub>max</sub>(μm)</th>
            <th>BET(m²/g)</th>
            <th>LiOH(%)</th>
            <th>Li<sub>2</sub>CO<sub>3</sub>(%)</th>
            <th>Fe(ppm)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{isEditing ? <input type="text" value={editData.coaResults.dMin} onChange={(e) => setEditData({ ...editData, coaResults: { ...editData.coaResults, dMin: e.target.value } })} className={styles.tableInput} /> : editData.coaResults.dMin}</td>
            <td>{isEditing ? <input type="text" value={editData.coaResults.dMax} onChange={(e) => setEditData({ ...editData, coaResults: { ...editData.coaResults, dMax: e.target.value } })} className={styles.tableInput} /> : editData.coaResults.dMax}</td>
            <td>{isEditing ? <input type="text" value={editData.coaResults.bet} onChange={(e) => setEditData({ ...editData, coaResults: { ...editData.coaResults, bet: e.target.value } })} className={styles.tableInput} /> : editData.coaResults.bet}</td>
            <td>{isEditing ? <input type="text" value={editData.coaResults.lioh} onChange={(e) => setEditData({ ...editData, coaResults: { ...editData.coaResults, lioh: e.target.value } })} className={styles.tableInput} /> : editData.coaResults.lioh}</td>
            <td>{isEditing ? <input type="text" value={editData.coaResults.li2co3} onChange={(e) => setEditData({ ...editData, coaResults: { ...editData.coaResults, li2co3: e.target.value } })} className={styles.tableInput} /> : editData.coaResults.li2co3}</td>
            <td>{isEditing ? <input type="text" value={editData.coaResults.fe} onChange={(e) => setEditData({ ...editData, coaResults: { ...editData.coaResults, fe: e.target.value } })} className={styles.tableInput} /> : editData.coaResults.fe}</td>
          </tr>
        </tbody>
      </table>

      {/* 수입검사 결과 이미지 */}
      <div className={styles.tableTitleRow} style={{ marginTop: '16px' }}>
        <h3 className={styles.tableTitle}>■ 수입검사 결과 이미지</h3>
      </div>
      <div className={styles.imageGrid}>
        <div className={styles.imageBox}>
          <div className={styles.imageLabel}>PSD</div>
          <div className={styles.imageContent}>
            {editData.images.psd ? (
              <img src={editData.images.psd} alt="PSD" className={styles.resultImage} />
            ) : (
              <span className={styles.noImage}>이미지 없음</span>
            )}
          </div>
        </div>
        <div className={styles.imageBox}>
          <div className={styles.imageLabel}>Half cell</div>
          <div className={styles.imageContent}>
            {editData.images.halfCell ? (
              <img src={editData.images.halfCell} alt="Half cell" className={styles.resultImage} />
            ) : (
              <span className={styles.noImage}>이미지 없음</span>
            )}
          </div>
        </div>
        <div className={styles.imageBox}>
          <div className={styles.imageLabel}>FE-SEM(배율: x1,000)</div>
          <div className={styles.imageContent}>
            {editData.images.feSem ? (
              <img src={editData.images.feSem} alt="FE-SEM" className={styles.resultImage} />
            ) : (
              <span className={styles.noImage}>이미지 없음</span>
            )}
          </div>
        </div>
      </div>

      {/* Remark */}
      <div className={styles.tableTitleRow} style={{ marginTop: '16px' }}>
        <h3 className={styles.tableTitle}>■ Remark</h3>
      </div>
      <div className={styles.remarkBox}>
        {isEditing ? (
          <textarea
            className={styles.remarkTextarea}
            value={editData.remarks}
            onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
            placeholder="비고를 입력하세요..."
          />
        ) : (
          <pre className={styles.remarkContent}>
            {editData.remarks || '비고 없음'}
          </pre>
        )}
      </div>
    </div>
  );
};

export default CathodeMaterial1Table;
