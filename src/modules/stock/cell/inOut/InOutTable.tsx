import type { GroupedTableData } from './types';
import styles from '../../../../styles/stock/cell/InOut.module.css';

interface InOutTableProps {
  groupedData: GroupedTableData[];
}

export default function InOutTable({ groupedData }: InOutTableProps) {
  return (
    <div className={styles.tableSection}>
      <table className={styles.dataTable}>
        <thead>
          <tr className={styles.titleRow}>
            <th colSpan={7}>프로젝트 별 Cell 입/출고 현황</th>
          </tr>
          <tr>
            <th>Project Name</th>
            <th>등급</th>
            <th>총 량</th>
            <th>보유 수량</th>
            <th>총 입고량</th>
            <th>총 출고량</th>
            <th>기타</th>
          </tr>
        </thead>
        <tbody>
          {groupedData.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            groupedData.map((group, groupIdx) =>
              group.rows.map((row, rowIdx) => (
                <tr key={`${groupIdx}-${rowIdx}`}>
                  {rowIdx === 0 && (
                    <td rowSpan={group.rows.length} className={styles.projectNameCell}>
                      {group.projectName}
                    </td>
                  )}
                  <td>{row.grade}</td>
                  <td>{row.totalQty}</td>
                  <td>{row.holdingQty}</td>
                  <td>{row.inboundQty}</td>
                  <td>{row.outboundQty}</td>
                  <td>{row.other || '-'}</td>
                </tr>
              ))
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
