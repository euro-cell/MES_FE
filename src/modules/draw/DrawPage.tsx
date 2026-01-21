import { useLocation } from 'react-router-dom';
import styles from '../../styles/draw/DrawingLedger.module.css';
import { MOCK_DRAWING_LEDGER } from './DrawMockData';
import type { DrawingCategory } from './DrawTypes';

export default function DrawPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category') as DrawingCategory | null;

  const filteredData = category ? MOCK_DRAWING_LEDGER.filter(item => item.category === category) : MOCK_DRAWING_LEDGER;

  const formatDate = (dateStr: string) => {
    if (dateStr.length === 6) {
      const yy = dateStr.slice(0, 2);
      const mm = dateStr.slice(2, 4);
      const dd = dateStr.slice(4, 6);
      const year = Number(yy) > 50 ? `19${yy}` : `20${yy}`;
      return `${year}-${mm}-${dd}`;
    }
    return dateStr;
  };

  return (
    <div className={styles.ledgerPage}>
      <div className={styles.header}></div>

      <table className={styles.ledgerTable}>
        <thead>
          <tr>
            <th>No.</th>
            <th>등록일자</th>
            <th>프로젝트명 (공장명/제품명/설비명)</th>
            <th>도면 번호</th>
            <th>Version</th>
            <th>도면 내용</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{formatDate(item.registeredDate)}</td>
              <td>{item.projectName}</td>
              <td>{item.drawingNo}</td>
              <td>{item.version}</td>
              <td>{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
