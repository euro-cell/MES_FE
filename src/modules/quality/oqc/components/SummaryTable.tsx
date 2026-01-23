import styles from '../../../../styles/quality/oqc/SummaryTable.module.css';

interface SummaryTableProps {
  projectId: number;
}

export default function SummaryTable({ projectId: _projectId }: SummaryTableProps) {
  // TODO: API 연동 후 실제 데이터로 교체
  const projectInfo = {
    projectName: '나비타스향 사전생산 전극 품질검증',
    modelName: 'UFC-L38C',
    version: 'V5.9',
    lotNo: '',
    usage: 'Navitas 6T 1-A75 샘플 대응',
    manager: '심윤성 책임연구원',
  };

  const gradeInfo = [
    { grade: 'A', description: '양품', color: 'green' },
    { grade: 'B', description: '부적합 특채', color: 'yellow' },
    { grade: 'C', description: '부적합 폐기', color: 'red' },
  ];

  const oqcData = [
    // Grading
    { category: 'Grading', rowSpan: 4, item: '기준용량(V5.9-1)', cycle: '전수', unit: 'Ah', spec: '≥37.8', avg: '39.19', max: '39.24', min: '39.15', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: '기준용량(V5.9-2)', cycle: '전수', unit: 'Ah', spec: '≥19.9', avg: '20.45', max: '20.50', min: '20.40', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: 'OCV3 (출하충전)', cycle: '전수', unit: 'V', spec: '≥2.19', avg: '2.194', max: '2.194', min: '2.193', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: 'AC-IR', cycle: '전수', unit: 'mΩ', spec: '≤1.0', avg: '0.659', max: '0.669', min: '0.651', result: '합격', note: '' },
    // 외관
    { category: '외관', rowSpan: 5, item: '가스 발생 육안검사', cycle: '전수', unit: '', spec: '없음', avg: '이상없음', max: '', min: '', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: '돌출(직경≤2mm)', cycle: '전수', unit: 'ea', spec: '≤4', avg: '이상없음', max: '', min: '', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: '긁힘(폭≤0.5mm, 길이≥5mm)', cycle: '전수', unit: 'ea', spec: '≤10', avg: '이상없음', max: '', min: '', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: '찍힘(직경≤2mm)', cycle: '전수', unit: 'ea', spec: '≤10', avg: '이상없음', max: '', min: '', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: '누액 및 부식', cycle: '전수', unit: '', spec: '없음', avg: '이상없음', max: '', min: '', result: '합격', note: '' },
    // 치수
    { category: '치수', rowSpan: 4, item: '폭', cycle: '1회/10ea', unit: 'mm', spec: '195±1', avg: '196.00', max: '196.00', min: '196.00', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: '길이', cycle: '1회/10ea', unit: 'mm', spec: '215±1', avg: '215.00', max: '215.00', min: '215.00', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: '두께(V5.9-1)', cycle: '전수', unit: 'mm', spec: '10.8±0.5', avg: '11.0', max: '11.1', min: '11.0', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: '두께(V5.9-2)', cycle: '전수', unit: 'mm', spec: '6.0±0.5', avg: '6.1', max: '6.1', min: '6.1', result: '합격', note: '' },
    // 중량
    { category: '중량', rowSpan: 2, item: '무게(V5.9-1)', cycle: '전수', unit: 'g', spec: '899±9', avg: '895', max: '899', min: '892', result: '합격', note: '' },
    { category: '', rowSpan: 0, item: '무게(V5.9-2)', cycle: '전수', unit: 'g', spec: '492±9', avg: '489', max: '490', min: '488', result: '합격', note: '' },
  ];

  const getGradeRowClass = (color: string) => {
    switch (color) {
      case 'green':
        return styles.gradeGreen;
      case 'yellow':
        return styles.gradeYellow;
      case 'red':
        return styles.gradeRed;
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      {/* 상단 영역: 프로젝트 개요 + 반제품 품질 부적합 구분 */}
      <div className={styles.topSection}>
        {/* 프로젝트 개요 */}
        <div className={styles.projectOverview}>
          <div className={styles.sectionTitle}>■ 프로젝트 개요</div>
          <table className={styles.infoTable}>
            <thead>
              <tr>
                <th>구분</th>
                <th>내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>프로젝트 명</th>
                <td>{projectInfo.projectName}</td>
              </tr>
              <tr>
                <th>모델명</th>
                <td>{projectInfo.modelName}</td>
              </tr>
              <tr>
                <th>Version</th>
                <td>{projectInfo.version}</td>
              </tr>
              <tr>
                <th>Lot No.</th>
                <td>{projectInfo.lotNo}</td>
              </tr>
              <tr>
                <th>사용처</th>
                <td>{projectInfo.usage}</td>
              </tr>
              <tr>
                <th>책임자</th>
                <td>{projectInfo.manager}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 반제품 품질 부적합 구분 */}
        <div className={styles.gradeClassification}>
          <div className={styles.sectionTitle}>■ 반제품 품질 부적합 구분</div>
          <table className={styles.gradeTable}>
            <thead>
              <tr>
                <th>등급</th>
                <th>내용</th>
              </tr>
            </thead>
            <tbody>
              {gradeInfo.map(item => (
                <tr key={item.grade} className={getGradeRowClass(item.color)}>
                  <td className={styles.gradeCellCenter}>{item.grade}</td>
                  <td>{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OQC List */}
      <div className={styles.oqcSection}>
        <div className={styles.sectionTitle}>■ OQC List</div>
        <table className={styles.oqcTable}>
          <thead>
            <tr>
              <th rowSpan={2}>구분</th>
              <th rowSpan={2}>검사항목</th>
              <th colSpan={3}>검사기준</th>
              <th colSpan={3}>품질검사 측정값 또는 상태</th>
              <th>종합판정</th>
              <th rowSpan={2}>비고</th>
            </tr>
            <tr>
              <th>검사주기</th>
              <th>단위</th>
              <th>규격</th>
              <th>평균치</th>
              <th>최대치</th>
              <th>최소치</th>
              <th>합/불</th>
            </tr>
          </thead>
          <tbody>
            {oqcData.map((row, index) => (
              <tr key={index}>
                {row.rowSpan > 0 && (
                  <td rowSpan={row.rowSpan} className={styles.categoryCell}>
                    {row.category}
                  </td>
                )}
                <td className={styles.itemCell}>{row.item}</td>
                <td>{row.cycle}</td>
                <td>{row.unit}</td>
                <td>{row.spec}</td>
                <td>{row.avg}</td>
                <td>{row.max}</td>
                <td>{row.min}</td>
                <td className={row.result === '합격' ? styles.passCell : styles.failCell}>
                  {row.result}
                </td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
