import React, { useState, useMemo, useEffect } from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';
import summaryStyles from '../../../../styles/quality/iqc/SummaryTable.module.css';
import type { IQCItem, IQCResult, IQCSummary } from '../IQCTypes';
import { getIQCSummary, updateIQCSummary } from '../../../../api/quality/IQCService';
import { getErrorMessage } from '../../../../api/errorHandler';

interface SummaryTableProps {
  items: IQCItem[];
  projectId: number;
  projectName: string;
}

interface DashboardRow {
  품목: string;
  품명: string;
  lot: string;
  검사항목: string;
  단위: string;
  규격: string;
  평균: number | null;
  최대: number | null;
  최소: number | null;
  판정: '합' | '불';
  비고: string;
}

/** IQCItem.category → Summary 표시 순서 */
const CATEGORY_ORDER = ['양극재', '양극재2', '음극재', '도전재', '도전재2', '집전체', '분리막', '전해액', '파우치', '리드탭'];

function resultLabel(result: IQCResult): string {
  return result.item ? `${result.category}(${result.item})` : result.category;
}

function toNumber(value: number | string | undefined): number | null {
  if (value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(n) ? null : n;
}

function buildRows(items: IQCItem[]): DashboardRow[] {
  const sorted = [...items].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category);
    const bi = CATEGORY_ORDER.indexOf(b.category);
    return (ai === -1 ? CATEGORY_ORDER.length : ai) - (bi === -1 ? CATEGORY_ORDER.length : bi);
  });

  const rows: DashboardRow[] = [];
  for (const item of sorted) {
    for (const result of item.results ?? []) {
      const samples = [toNumber(result.sample1), toNumber(result.sample2), toNumber(result.sample3)].filter(
        (n): n is number => n !== null
      );
      rows.push({
        품목: item.category,
        품명: item.name,
        lot: item.lotNo ?? '',
        검사항목: resultLabel(result),
        단위: result.unit ?? '',
        규격: result.spec ?? '',
        평균: toNumber(result.average) ?? (samples.length > 0 ? samples.reduce((a, b) => a + b, 0) / samples.length : null),
        최대: samples.length > 0 ? Math.max(...samples) : null,
        최소: samples.length > 0 ? Math.min(...samples) : null,
        판정: result.isPassed === false ? '불' : '합',
        비고: result.note ?? '',
      });
    }
  }
  return rows;
}

function formatValue(value: number | null, unit: string): string {
  if (value === null) return '-';
  if (unit === 'ppm') return Math.round(value).toString();
  if (unit === 'g/cc') return value.toFixed(2);
  if (unit === 'mAh/g') return value.toFixed(1);
  return value.toFixed(1);
}

function calcRowSpans(rows: DashboardRow[], key: keyof DashboardRow): number[] {
  const spans: number[] = new Array(rows.length).fill(0);
  let i = 0;
  while (i < rows.length) {
    let j = i + 1;
    while (j < rows.length && rows[j][key] === rows[i][key]) j++;
    spans[i] = j - i;
    i = j;
  }
  return spans;
}

const defaultSummary = (): IQCSummary => ({
  modelName: '',
  version: '',
  lotNo: '',
  usage: '',
  manager: '',
  specialNotes: '',
  remark: '',
});

const SummaryTable: React.FC<SummaryTableProps> = ({ items, projectId, projectName }) => {
  const [summary, setSummary] = useState<IQCSummary>(defaultSummary());
  const [isEditing, setIsEditing] = useState(false);
  const [editSummary, setEditSummary] = useState<IQCSummary>(defaultSummary());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getIQCSummary(projectId)
      .then((data) => setSummary({ ...defaultSummary(), ...data }))
      .catch((err) => console.error('IQC Summary 조회 실패:', err));
  }, [projectId]);

  const handleEdit = () => {
    setEditSummary(summary);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditSummary(summary);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await updateIQCSummary(projectId, editSummary);
      setSummary({ ...defaultSummary(), ...saved });
      setIsEditing(false);
    } catch (err) {
      alert(getErrorMessage(err, 'Summary 저장에 실패했습니다.'));
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(() => buildRows(items), [items]);
  const rowSpans품목 = calcRowSpans(rows, '품목');
  const rowSpans품명 = calcRowSpans(rows, '품명');
  const rowSpansLot = calcRowSpans(rows, 'lot');

  return (
    <div className={summaryStyles.container}>

      {/* 상단 3분할 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 1fr', gap: '12px' }}>

        {/* 프로젝트 개요 */}
        <div>
          <div className={styles.tableTitleRow}>
            <h3 className={styles.tableTitle}>■ 프로젝트 개요</h3>
            {!isEditing ? (
              <button className={styles.specButton} onClick={handleEdit}>수정</button>
            ) : (
              <>
                <button className={styles.saveButton} onClick={handleSave} disabled={saving} style={{ marginRight: '8px' }}>
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button className={styles.cancelButton} onClick={handleCancel}>취소</button>
              </>
            )}
          </div>
          <table className={styles.iqcTable}>
            <colgroup>
              <col style={{ width: '35%' }} />
              <col />
            </colgroup>
            <tbody>
              <tr><td className={styles.itemCell}>프로젝트 명</td><td style={{ textAlign: 'left' }}>{projectName}</td></tr>
              <tr>
                <td className={styles.itemCell}>모델명</td>
                <td>{isEditing ? (
                  <input type="text" value={editSummary.modelName ?? ''} onChange={(e) => setEditSummary({ ...editSummary, modelName: e.target.value })} className={styles.tableInput} placeholder="입력" />
                ) : <span style={{ textAlign: 'left' }}>{summary.modelName || '-'}</span>}</td>
              </tr>
              <tr>
                <td className={styles.itemCell}>Version</td>
                <td>{isEditing ? (
                  <input type="text" value={editSummary.version ?? ''} onChange={(e) => setEditSummary({ ...editSummary, version: e.target.value })} className={styles.tableInput} placeholder="입력" />
                ) : <span style={{ textAlign: 'left' }}>{summary.version || '-'}</span>}</td>
              </tr>
              <tr>
                <td className={styles.itemCell}>Lot No.</td>
                <td>{isEditing ? (
                  <input type="text" value={editSummary.lotNo ?? ''} onChange={(e) => setEditSummary({ ...editSummary, lotNo: e.target.value })} className={styles.tableInput} placeholder="입력" />
                ) : <span style={{ textAlign: 'left' }}>{summary.lotNo || '-'}</span>}</td>
              </tr>
              <tr>
                <td className={styles.itemCell}>사용처</td>
                <td>{isEditing ? (
                  <input type="text" value={editSummary.usage ?? ''} onChange={(e) => setEditSummary({ ...editSummary, usage: e.target.value })} className={styles.tableInput} placeholder="입력" />
                ) : <span style={{ textAlign: 'left' }}>{summary.usage || '-'}</span>}</td>
              </tr>
              <tr>
                <td className={styles.itemCell}>책임자</td>
                <td>{isEditing ? (
                  <input type="text" value={editSummary.manager ?? ''} onChange={(e) => setEditSummary({ ...editSummary, manager: e.target.value })} className={styles.tableInput} placeholder="입력" />
                ) : <span style={{ textAlign: 'left' }}>{summary.manager || '-'}</span>}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 반제품 품질 부적합 구분 */}
        <div>
          <div className={styles.tableTitleRow}>
            <h3 className={styles.tableTitle}>■ 반제품 품질 부적합 구분</h3>
          </div>
          <table className={styles.iqcTable}>
            <thead>
              <tr><th>등급</th><th>내용</th></tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ background: '#DAF2D0', fontWeight: 700 }}>A</td>
                <td>양품</td>
              </tr>
              <tr>
                <td style={{ background: '#FFC000', fontWeight: 700 }}>B</td>
                <td>부적합 특채</td>
              </tr>
              <tr>
                <td style={{ background: '#FBE2D5', fontWeight: 700 }}>C</td>
                <td>부적합 폐기</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 특이사항 */}
        <div>
          <div className={styles.tableTitleRow}>
            <h3 className={styles.tableTitle}>■ 특이사항</h3>
          </div>
          <div className={styles.remarkBox}>
            {isEditing ? (
              <textarea
                className={styles.remarkTextarea}
                rows={4}
                value={editSummary.specialNotes ?? ''}
                onChange={(e) => setEditSummary({ ...editSummary, specialNotes: e.target.value })}
                placeholder="특이사항을 입력하세요..."
                style={{ minHeight: '100px' }}
              />
            ) : (
              <pre className={styles.remarkContent} style={{ minHeight: '100px' }}>{summary.specialNotes || '특이사항 없음'}</pre>
            )}
          </div>
        </div>
      </div>

      {/* Remark */}
      <div>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>■ Remark</h3>
        </div>
        <div className={styles.remarkBox}>
          {isEditing ? (
            <textarea
              className={styles.remarkTextarea}
              value={editSummary.remark ?? ''}
              onChange={(e) => setEditSummary({ ...editSummary, remark: e.target.value })}
              placeholder="Remark를 입력하세요..."
            />
          ) : (
            <pre className={styles.remarkContent}>{summary.remark || 'Remark 없음'}</pre>
          )}
        </div>
      </div>

      {/* IQC List 테이블 */}
      <div>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>■ IQC List</h3>
        </div>
        <table className={styles.iqcTable}>
          <colgroup>
            <col style={{ width: '7%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '5%' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>품목</th>
              <th>품명</th>
              <th>Lot no.</th>
              <th>검사항목</th>
              <th>단위</th>
              <th>규격</th>
              <th>평균치</th>
              <th>최대치</th>
              <th>최소치</th>
              <th>합/불</th>
              <th>조치 및 의견</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isPass = row.판정 === '합';
              const span품목 = rowSpans품목[idx];
              const span품명 = rowSpans품명[idx];
              const spanLot = rowSpansLot[idx];
              return (
                <tr key={idx}>
                  {span품목 > 0 && (
                    <td
                      rowSpan={span품목}
                      style={{
                        background: '#1e4a8c',
                        color: '#fff',
                        fontWeight: 700,
                        verticalAlign: 'middle',
                        borderColor: '#1a3d73',
                      }}
                    >
                      {row.품목}
                    </td>
                  )}
                  {span품명 > 0 && <td rowSpan={span품명} style={{ verticalAlign: 'middle' }}>{row.품명}</td>}
                  {spanLot > 0 && <td rowSpan={spanLot} style={{ verticalAlign: 'middle' }}>{row.lot}</td>}
                  <td>{row.검사항목}</td>
                  <td>{row.단위}</td>
                  <td>{row.규격}</td>
                  <td>{formatValue(row.평균, row.단위)}</td>
                  <td>{formatValue(row.최대, row.단위)}</td>
                  <td>{formatValue(row.최소, row.단위)}</td>
                  <td
                    className={styles.passCell}
                    style={{
                      background: isPass ? '#DAF2D0' : '#FFC000',
                      color: '#1e293b',
                      fontWeight: 700,
                    }}
                  >
                    {row.판정}
                  </td>
                  <td style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'keep-all' }}>
                    {row.비고}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default SummaryTable;
