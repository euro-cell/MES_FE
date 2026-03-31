import iqcStyles from '../../../../styles/quality/iqc/IQCTable.module.css';

interface ProjectInfo {
  name: string;
  modelName: string;
  version: string;
  lotNo: string;
  usagePlace: string;
  manager: string;
}

interface MeasureField {
  avg: string;
  max: string;
  min: string;
  result: '합' | '불' | '';
  maxExceeded?: boolean;
  minExceeded?: boolean;
  avgExceeded?: boolean;
  note?: string;
}

interface SummaryData {
  project: ProjectInfo;
  grading: {
    stdCap: MeasureField;
    ocv3: MeasureField;
    acir: MeasureField;
    deltaV: MeasureField;
  };
  appearance: {
    protrusion: { result: '합' | '불' | ''; note?: string };
    scratch: { result: '합' | '불' | ''; note?: string };
  };
  dims: {
    width: MeasureField;
    length: MeasureField;
    thick: MeasureField;
  };
  weight: MeasureField;
}

interface SummaryTableProps {
  projectId: number;
}

// TODO: API 연동 후 실제 데이터로 교체
const MOCK_DATA: SummaryData = {
  project: {
    name: 'Poko향 ESS용 시제품 생산',
    modelName: 'UFC-L38C',
    version: 'V5.8',
    lotNo: '',
    usagePlace: 'Poko향 선박 ESS 1set분 샘플',
    manager: '심윤성 책임연구원',
  },
  grading: {
    stdCap: { avg: '38.92', max: '39.41', min: '37.77', result: '합' },
    ocv3:   { avg: '2.196', max: '2.197', min: '2.194', result: '합' },
    acir:   { avg: '0.635', max: '0.789', min: '0.560', result: '합' },
    deltaV: { avg: '1.8',   max: '37.4',  min: '0.2',  result: '불', maxExceeded: true, note: '보관기간: 1개월' },
  },
  appearance: {
    protrusion: { result: '합', note: '' },
    scratch:    { result: '합', note: '' },
  },
  dims: {
    width:  { avg: '195.05', max: '195.20', min: '194.90', result: '합' },
    length: { avg: '215.10', max: '215.30', min: '214.90', result: '합' },
    thick:  { avg: '11.0',   max: '11.2',   min: '10.8',   result: '합' },
  },
  weight: { avg: '905', max: '912', min: '898', result: '합' },
};

const EXCEEDED_STYLE: React.CSSProperties = { background: '#FBE2D5' };

function passStyle(result: '합' | '불' | ''): React.CSSProperties {
  if (result === '합') return { background: '#DAF2D0', fontWeight: 700 };
  if (result === '불') return { background: '#FBE2D5', fontWeight: 700 };
  return {};
}

export default function SummaryTable({ projectId: _projectId }: SummaryTableProps) {
  const d = MOCK_DATA;

  return (
    <div className={iqcStyles.tableContainer}>

      {/* 상단: 프로젝트 개요 + 반제품 품질 부적합 구분 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12 }}>

        {/* 프로젝트 개요 */}
        <div>
          <div className={iqcStyles.tableTitleRow}>
            <h3 className={iqcStyles.tableTitle}>■ 프로젝트 개요</h3>
          </div>
          <table className={iqcStyles.iqcTable}>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col />
            </colgroup>
            <tbody>
              {[
                ['프로젝트 명', d.project.name],
                ['모델명',     d.project.modelName],
                ['Version',    d.project.version],
                ['Lot No.',    d.project.lotNo],
                ['사용처',     d.project.usagePlace],
                ['책임자',     d.project.manager],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className={iqcStyles.itemCell}>{label}</td>
                  <td style={{ textAlign: 'left' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 반제품 품질 부적합 구분 */}
        <div>
          <div className={iqcStyles.tableTitleRow}>
            <h3 className={iqcStyles.tableTitle}>■ 반제품 품질 부적합 구분</h3>
          </div>
          <table className={iqcStyles.iqcTable}>
            <thead>
              <tr>
                <th>등급</th>
                <th>내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ background: '#DAF2D0', fontWeight: 700, textAlign: 'center' }}>A</td>
                <td>양품</td>
              </tr>
              <tr>
                <td style={{ background: '#FFC000', fontWeight: 700, textAlign: 'center' }}>B</td>
                <td>부적합 특채</td>
              </tr>
              <tr>
                <td style={{ background: '#FBE2D5', fontWeight: 700, textAlign: 'center' }}>C</td>
                <td>부적합 폐기</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* OQC List */}
      <div>
        <div className={iqcStyles.tableTitleRow}>
          <h3 className={iqcStyles.tableTitle}>■ OQC List</h3>
        </div>
        <table className={iqcStyles.iqcTable}>
          <colgroup>
            <col style={{ width: '6%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '6%' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>구분</th>
              <th>검사항목</th>
              <th>단위</th>
              <th>규격</th>
              <th>평균치</th>
              <th>최대치</th>
              <th>최소치</th>
              <th>합/불</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {/* Grading */}
            <tr>
              <td rowSpan={4} style={{ background: '#1e4a8c', color: '#fff', fontWeight: 700, verticalAlign: 'middle', borderColor: '#1a3d73' }}>Grading</td>
              <td className={iqcStyles.itemCell}>기준용량</td>
              <td>Ah</td>
              <td>≥37.8</td>
              <td>{d.grading.stdCap.avg}</td>
              <td>{d.grading.stdCap.max}</td>
              <td>{d.grading.stdCap.min}</td>
              <td style={passStyle(d.grading.stdCap.result)}>{d.grading.stdCap.result}</td>
              <td style={{ textAlign: 'left' }}>{d.grading.stdCap.note ?? ''}</td>
            </tr>
            <tr>
              <td className={iqcStyles.itemCell}>출하충전 OCV3</td>
              <td>V</td>
              <td>≥2.19</td>
              <td>{d.grading.ocv3.avg}</td>
              <td>{d.grading.ocv3.max}</td>
              <td>{d.grading.ocv3.min}</td>
              <td style={passStyle(d.grading.ocv3.result)}>{d.grading.ocv3.result}</td>
              <td></td>
            </tr>
            <tr>
              <td className={iqcStyles.itemCell}>출하충전 AC-IR</td>
              <td>mΩ</td>
              <td>≤1.0</td>
              <td>{d.grading.acir.avg}</td>
              <td>{d.grading.acir.max}</td>
              <td>{d.grading.acir.min}</td>
              <td style={passStyle(d.grading.acir.result)}>{d.grading.acir.result}</td>
              <td></td>
            </tr>
            <tr>
              <td className={iqcStyles.itemCell}>출하보관 △V</td>
              <td>mV</td>
              <td>≤3.3</td>
              <td style={d.grading.deltaV.avgExceeded ? EXCEEDED_STYLE : {}}>{d.grading.deltaV.avg}</td>
              <td style={d.grading.deltaV.maxExceeded ? EXCEEDED_STYLE : {}}>{d.grading.deltaV.max}</td>
              <td style={d.grading.deltaV.minExceeded ? EXCEEDED_STYLE : {}}>{d.grading.deltaV.min}</td>
              <td style={passStyle(d.grading.deltaV.result)}>{d.grading.deltaV.result}</td>
              <td style={{ textAlign: 'left' }}>{d.grading.deltaV.note ?? ''}</td>
            </tr>

            {/* 외관 */}
            <tr>
              <td rowSpan={5} style={{ background: '#1e4a8c', color: '#fff', fontWeight: 700, verticalAlign: 'middle', borderColor: '#1a3d73' }}>외관</td>
              <td className={iqcStyles.itemCell}>가스 발생 육안검사</td>
              <td></td>
              <td>없음</td>
              <td>이상없음</td>
              <td>-</td>
              <td>-</td>
              <td style={passStyle('합')}>합</td>
              <td></td>
            </tr>
            <tr>
              <td className={iqcStyles.itemCell}>돌출(직경≤2mm)</td>
              <td>ea</td>
              <td>≤4</td>
              <td></td>
              <td>-</td>
              <td>-</td>
              <td style={passStyle('합')}>합</td>
              <td style={{ textAlign: 'left' }}>{d.appearance.protrusion.note ?? ''}</td>
            </tr>
            <tr>
              <td className={iqcStyles.itemCell}>긁힘(폭≤0.5mm, 길이≥5mm)</td>
              <td>ea</td>
              <td>≤10</td>
              <td>이상없음</td>
              <td>-</td>
              <td>-</td>
              <td style={passStyle('합')}>합</td>
              <td></td>
            </tr>
            <tr>
              <td className={iqcStyles.itemCell}>찍힘(직경≤2mm)</td>
              <td>ea</td>
              <td>≤10</td>
              <td></td>
              <td>-</td>
              <td>-</td>
              <td style={passStyle('합')}>합</td>
              <td style={{ textAlign: 'left' }}>{d.appearance.scratch.note ?? ''}</td>
            </tr>
            <tr>
              <td className={iqcStyles.itemCell}>누액 및 부식</td>
              <td></td>
              <td>없음</td>
              <td>이상없음</td>
              <td>-</td>
              <td>-</td>
              <td style={passStyle('합')}>합</td>
              <td></td>
            </tr>

            {/* 치수 */}
            <tr>
              <td rowSpan={3} style={{ background: '#1e4a8c', color: '#fff', fontWeight: 700, verticalAlign: 'middle', borderColor: '#1a3d73' }}>치수</td>
              <td className={iqcStyles.itemCell}>폭</td>
              <td>mm</td>
              <td>195±1</td>
              <td>{d.dims.width.avg}</td>
              <td>{d.dims.width.max}</td>
              <td>{d.dims.width.min}</td>
              <td style={passStyle(d.dims.width.result)}>{d.dims.width.result}</td>
              <td></td>
            </tr>
            <tr>
              <td className={iqcStyles.itemCell}>길이</td>
              <td>mm</td>
              <td>215±1</td>
              <td>{d.dims.length.avg}</td>
              <td>{d.dims.length.max}</td>
              <td>{d.dims.length.min}</td>
              <td style={passStyle(d.dims.length.result)}>{d.dims.length.result}</td>
              <td></td>
            </tr>
            <tr>
              <td className={iqcStyles.itemCell}>두께</td>
              <td>mm</td>
              <td>11.0±0.5</td>
              <td>{d.dims.thick.avg}</td>
              <td>{d.dims.thick.max}</td>
              <td>{d.dims.thick.min}</td>
              <td style={passStyle(d.dims.thick.result)}>{d.dims.thick.result}</td>
              <td></td>
            </tr>

            {/* 중량 */}
            <tr>
              <td style={{ background: '#1e4a8c', color: '#fff', fontWeight: 700, verticalAlign: 'middle', borderColor: '#1a3d73' }}>중량</td>
              <td className={iqcStyles.itemCell}>무게</td>
              <td>g</td>
              <td>903±10</td>
              <td>{d.weight.avg}</td>
              <td>{d.weight.max}</td>
              <td>{d.weight.min}</td>
              <td style={passStyle(d.weight.result)}>{d.weight.result}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
