import type { CellInventoryDetail } from './ProjectService';
import styles from '../../../../styles/stock/cell/ProjectDetail.module.css';

interface ProjectTableProps {
  data: CellInventoryDetail[];
}

export default function ProjectTable({ data }: ProjectTableProps) {
  // 모든 데이터가 Project No.와 모델을 가지고 있는지 확인
  const hasAllProjectNo = data.every(item => item.projectNo);
  const hasAllModel = data.every(item => item.model);
  const showProjectNoAndModel = hasAllProjectNo && hasAllModel;

  if (data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className={styles.tableSection}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>No.</th>
            <th>Lot No.</th>
            <th>프로젝트명</th>
            {showProjectNoAndModel && <th>Project No.</th>}
            {showProjectNoAndModel && <th>모델</th>}
            <th>등급</th>
            <th>NCR 등급</th>
            <th>보관 일자</th>
            <th>보관 위치</th>
            <th>출고 일자</th>
            <th>출고 현황</th>
            <th>인계자</th>
            <th>인수자</th>
            <th>상세</th>
            <th>상태</th>
            <th>재입고</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={item.id} style={item.isShipped ? { backgroundColor: '#fff9e6' } : {}}>
              <td>{idx + 1}</td>
              <td>{item.lot}</td>
              <td>{item.projectName}</td>
              {showProjectNoAndModel && <td>{item.projectNo}</td>}
              {showProjectNoAndModel && <td>{item.model}</td>}
              <td>{item.grade}</td>
              <td>{item.ncrGrade || '-'}</td>
              <td>{item.date}</td>
              <td>{item.storageLocation}</td>
              <td>{item.shippingDate || '-'}</td>
              <td>{item.shippingStatus || '-'}</td>
              <td>{item.deliverer}</td>
              <td>{item.receiver}</td>
              <td>{item.details || '-'}</td>
              <td>{item.isShipped ? '출고' : ''}</td>
              <td>{item.isRestocked ? '재입고' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
