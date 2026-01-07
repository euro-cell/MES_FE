import type { GroupedTableData } from './types';
import styles from '../../../../styles/stock/cell/InOut.module.css';

interface InOutTableProps {
  groupedData: GroupedTableData[];
}

const formatValue = (value: number | null): string => {
  return value === null ? '-' : String(value);
};

export default function InOutTable({ groupedData }: InOutTableProps) {
  // 합계 계산
  const calculateTotals = () => {
    let totalHolding = 0;
    let totalInbound = 0;
    let totalOutbound = 0;

    groupedData.forEach(group => {
      group.rows.forEach(row => {
        if (row.holdingQty !== null) totalHolding += row.holdingQty;
        if (row.inboundQty !== null) totalInbound += row.inboundQty;
        if (row.outboundQty !== null) totalOutbound += row.outboundQty;
      });
    });

    return { totalHolding, totalInbound, totalOutbound };
  };

  const totals = calculateTotals();
  const hasData = groupedData.length > 0 && groupedData.some(g => g.rows.length > 0);

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
          {!hasData ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            <>
              {groupedData.map((group, groupIdx) =>
                group.rows.map((row, rowIdx) => (
                  <tr key={`${groupIdx}-${rowIdx}`}>
                    {rowIdx === 0 && (
                      <td rowSpan={group.rows.length} className={styles.projectNameCell}>
                        {group.projectName}
                      </td>
                    )}
                    <td>{row.grade}</td>
                    {rowIdx === 0 && (
                      <td rowSpan={group.rows.length} className={styles.totalQtyCell}>{formatValue(row.totalQty)}</td>
                    )}
                    <td>{formatValue(row.holdingQty)}</td>
                    <td>{formatValue(row.inboundQty)}</td>
                    <td>{formatValue(row.outboundQty)}</td>
                    <td>{row.other || '-'}</td>
                  </tr>
                ))
              )}
              <tr className={styles.totalRow}>
                <td colSpan={2} style={{ fontWeight: 'bold' }}>
                  창고 내 총 셀 수량
                </td>
                <td colSpan={2} style={{ fontWeight: 'bold' }}>{totals.totalHolding}</td>
                <td style={{ fontWeight: 'bold' }}>{totals.totalInbound}</td>
                <td style={{ fontWeight: 'bold' }}>{totals.totalOutbound}</td>
                <td>-</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
