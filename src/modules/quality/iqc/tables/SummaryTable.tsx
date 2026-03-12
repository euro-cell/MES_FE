import React, { useState } from 'react';
import styles from '../../../../styles/quality/iqc/IQCTable.module.css';
import summaryStyles from '../../../../styles/quality/iqc/SummaryTable.module.css';
import type { IQCItem } from '../IQCTypes';

interface SummaryTableProps {
  items: IQCItem[];
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

const STATIC_ROWS: DashboardRow[] = [
  { 품목: '양극활물질1', 품명: 'NCM-622', lot: 'NCM622-0001(~7)', 검사항목: '입도(D50)', 단위: '㎛', 규격: '7.7±1.0', 평균: 7.93, 최대: 8.0, 최소: 7.9, 판정: '합', 비고: '' },
  { 품목: '양극활물질1', 품명: 'NCM-622', lot: 'NCM622-0001(~7)', 검사항목: '수분', 단위: 'ppm', 규격: 'TBD', 평균: 126.5, 최대: 128.97, 최소: 124.25, 판정: '합', 비고: '' },
  { 품목: '양극활물질1', 품명: 'NCM-622', lot: 'NCM622-0001(~7)', 검사항목: '탭밀도', 단위: 'g/cc', 규격: '2.10±0.30', 평균: 1.92, 최대: 1.93, 최소: 1.92, 판정: '합', 비고: '' },
  { 품목: '양극활물질1', 품명: 'NCM-622', lot: 'NCM622-0001(~7)', 검사항목: '비용량(0.1C)', 단위: 'mAh/g', 규격: '185.0±2.5', 평균: 183.43, 최대: 186.61, 최소: 181.28, 판정: '불', 비고: '최대치 합격으로 사용, 추후 재검증 계획' },
  { 품목: '양극활물질2', 품명: 'LCO-15DP', lot: 'GSL-15DP-24050502', 검사항목: '입도(D50)', 단위: '㎛', 규격: '16.0±1.5', 평균: 16.73, 최대: 16.9, 최소: 16.5, 판정: '합', 비고: '' },
  { 품목: '양극활물질2', 품명: 'LCO-15DP', lot: 'GSL-15DP-24050502', 검사항목: '수분', 단위: 'ppm', 규격: '≤150', 평균: 56.54, 최대: 58.23, 최소: 55.6, 판정: '합', 비고: '' },
  { 품목: '양극활물질2', 품명: 'LCO-15DP', lot: 'GSL-15DP-24050502', 검사항목: '탭밀도', 단위: 'g/cc', 규격: '2.8±0.2', 평균: 2.75, 최대: 2.79, 최소: 2.73, 판정: '합', 비고: '' },
  { 품목: '양극활물질2', 품명: 'LCO-15DP', lot: 'GSL-15DP-24050502', 검사항목: '비용량(0.1C)', 단위: 'mAh/g', 규격: '≥180', 평균: 184.3, 최대: 186.9, 최소: 181.8, 판정: '합', 비고: '' },
  { 품목: '음극활물질', 품명: 'T2', lot: 'TE011-250401', 검사항목: '입도(D50)', 단위: '㎛', 규격: '8.5±2.5', 평균: 8.51, 최대: 8.85, 최소: 8.01, 판정: '합', 비고: '' },
  { 품목: '음극활물질', 품명: 'T2', lot: 'TE011-250401', 검사항목: '수분', 단위: 'ppm', 규격: '≤1000', 평균: 491.73, 최대: 565.9, 최소: 417.55, 판정: '합', 비고: '' },
  { 품목: '음극활물질', 품명: 'T2', lot: 'TE011-250401', 검사항목: '탭밀도', 단위: 'g/cc', 규격: '≥1.00', 평균: 1.33, 최대: 1.34, 최소: 1.32, 판정: '합', 비고: '' },
  { 품목: '음극활물질', 품명: 'T2', lot: 'TE011-250401', 검사항목: '비용량(0.1C)', 단위: 'mAh/g', 규격: '≥165.0', 평균: 175.86, 최대: 178.68, 최소: 172.6, 판정: '합', 비고: '' },
  { 품목: '도전재', 품명: 'Super P Li', lot: '841D0212', 검사항목: '수분', 단위: '%', 규격: '≤0.3', 평균: 0.3, 최대: 0.3, 최소: 0.3, 판정: '합', 비고: '' },
  { 품목: '집전체', 품명: 'A1100-H18', lot: 'C2E410006(~21)', 검사항목: '두께', 단위: '㎛', 규격: '12±0.5', 평균: 12.22, 최대: 12.33, 최소: 12.0, 판정: '합', 비고: '' },
  { 품목: '집전체', 품명: 'A1100-H18', lot: 'C2E410006(~21)', 검사항목: '너비', 단위: 'mm', 규격: '230±1', 평균: 230.5, 최대: 230.5, 최소: 230.5, 판정: '합', 비고: '' },
  { 품목: '집전체', 품명: 'A1100-H18', lot: 'C2E410006(~21)', 검사항목: 'Loading', 단위: 'mg/㎠', 규격: '3.24±0.05', 평균: null, 최대: null, 최소: null, 판정: '합', 비고: '차후 Loading 품질검사 관리 계획' },
  { 품목: '분리막', 품명: 'PCS12E9E3S', lot: 'E12C1S2250321A01', 검사항목: '두께', 단위: '㎛', 규격: '12.0±1.5', 평균: 12.0, 최대: 12.0, 최소: 12.0, 판정: '합', 비고: '' },
  { 품목: '분리막', 품명: 'PCS12E9E3S', lot: 'E12C1S2250321A01', 검사항목: '너비', 단위: 'mm', 규격: '192.0±0.3', 평균: 192.0, 최대: 192.0, 최소: 192.0, 판정: '합', 비고: '' },
  { 품목: '분리막', 품명: 'PCS12E9E3S', lot: 'E12C1S2250321A01', 검사항목: 'Shrinkage(MD)', 단위: '%', 규격: '≤5.0', 평균: null, 최대: null, 최소: null, 판정: '합', 비고: '차후 Shrinkage 품질검사 관리 계획' },
  { 품목: '분리막', 품명: 'PCS12E9E3S', lot: 'E12C1S2250321A01', 검사항목: 'Shrinkage(TD)', 단위: '%', 규격: '≤5.0', 평균: null, 최대: null, 최소: null, 판정: '합', 비고: '차후 Shrinkage 품질검사 관리 계획' },
  { 품목: '전해액', 품명: 'ED-UFC-026A1', lot: 'SL25-0629', 검사항목: '수분', 단위: 'ppm', 규격: '≤20.0', 평균: 1.73, 최대: 1.9, 최소: 1.5, 판정: '합', 비고: '' },
  { 품목: '파우치', 품명: 'CP-153A', lot: 'A5C130102-A1-01(~4)', 검사항목: '두께', 단위: '㎛', 규격: '153±15', 평균: 153, 최대: 153, 최소: 153, 판정: '합', 비고: '' },
  { 품목: '파우치', 품명: 'CP-153A', lot: 'A5C130102-A1-01(~4)', 검사항목: '너비', 단위: 'mm', 규격: '400±1', 평균: 400, 최대: 400, 최소: 400, 판정: '합', 비고: '' },
  { 품목: '리드탭', 품명: 'Al-Tab', lot: 'EUAT250407K14', 검사항목: 'Al_너비', 단위: 'mm', 규격: '60.0±0.3', 평균: 59.95, 최대: 59.95, 최소: 59.94, 판정: '합', 비고: '' },
  { 품목: '리드탭', 품명: 'Al-Tab', lot: 'EUAT250407K14', 검사항목: 'Al_길이', 단위: 'mm', 규격: '36.0±0.5', 평균: 36.14, 최대: 36.15, 최소: 36.12, 판정: '합', 비고: '' },
  { 품목: '리드탭', 품명: 'Al-Tab', lot: 'EUAT250407K14', 검사항목: 'Al_두께', 단위: 'mm', 규격: '0.30±0.02', 평균: 0.31, 최대: 0.32, 최소: 0.3, 판정: '합', 비고: '' },
  { 품목: '리드탭', 품명: 'Al-Tab', lot: 'EUAT250407K14', 검사항목: 'Sealant_너비', 단위: 'mm', 규격: '70.0±0.5', 평균: 69.96, 최대: 69.97, 최소: 69.95, 판정: '합', 비고: '' },
  { 품목: '리드탭', 품명: 'Al-Tab', lot: 'EUAT250407K14', 검사항목: 'Sealant_길이', 단위: 'mm', 규격: '12.0±0.5', 평균: null, 최대: null, 최소: null, 판정: '합', 비고: '차후 Sealant(on the Al metal) 품질검사 관리 계획' },
  { 품목: '리드탭', 품명: 'Al-Tab', lot: 'EUAT250407K14', 검사항목: 'Sealant_두께', 단위: 'mm', 규격: '0.50±0.04', 평균: 0.51, 최대: 0.52, 최소: 0.5, 판정: '합', 비고: '' },
];

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

const REMARK_TEXT = `※ Reference data 비교 첨부 (직전 수입검사 결과)
- 4M 변경 시 유사품 대체 전의 원부자재 수입검사 결과
- 지속 사용 제품: 현재 Lot vs. 직전 입고 Lot
- 재고품: IQC 재진행 후 신규 결과 vs. 직전 수입검사 결과
- 재고품은 6개월 이내 수입검사 data 있을 경우 추가 IQC 보류`;

const SummaryTable: React.FC<SummaryTableProps> = ({ items: _items }) => {
  const [specialNotes, setSpecialNotes] = useState('');

  const rows = STATIC_ROWS;
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
          </div>
          <table className={styles.iqcTable}>
            <colgroup>
              <col style={{ width: '35%' }} />
              <col />
            </colgroup>
            <tbody>
              <tr><td className={styles.itemCell}>프로젝트 명</td><td style={{ textAlign: 'left' }}>Navitas향 UFC 시제품</td></tr>
              <tr><td className={styles.itemCell}>모델명</td><td style={{ textAlign: 'left' }}>UFC-L37C</td></tr>
              <tr><td className={styles.itemCell}>Version</td><td style={{ textAlign: 'left' }}>V5.8</td></tr>
              <tr>
                <td className={styles.itemCell}>Lot No.</td>
                <td><input type="text" placeholder="입력" className={styles.tableInput} /></td>
              </tr>
              <tr>
                <td className={styles.itemCell}>사용처</td>
                <td><input type="text" placeholder="입력" className={styles.tableInput} /></td>
              </tr>
              <tr><td className={styles.itemCell}>책임자</td><td style={{ textAlign: 'left' }}>심윤성 책임연구원</td></tr>
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
            <textarea
              className={styles.remarkTextarea}
              rows={4}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="특이사항을 입력하세요..."
              style={{ minHeight: '100px' }}
            />
          </div>
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

      {/* Remark */}
      <div>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>■ Remark</h3>
        </div>
        <div className={styles.remarkBox}>
          <pre className={styles.remarkContent}>{REMARK_TEXT}</pre>
        </div>
      </div>

    </div>
  );
};

export default SummaryTable;
