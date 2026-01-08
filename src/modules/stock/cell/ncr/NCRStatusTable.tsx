import type { NCRStatusData } from './types';
import styles from '../../../../styles/stock/cell/NCRStatus.module.css';

interface NCRStatusTableProps {
  data: NCRStatusData;
}

const formatValue = (value: number): string => {
  return value === 0 ? '-' : value.toString();
};

export default function NCRStatusTable({ data }: NCRStatusTableProps) {
  // Calculate subtotals
  const calculateSubtotal = (items: any[]) => ({
    v52: items.reduce((sum, item) => sum + (item.v52 || 0), 0),
    v55: items.reduce((sum, item) => sum + (item.v55 || 0), 0),
    v56: items.reduce((sum, item) => sum + (item.v56 || 0), 0),
    v57: items.reduce((sum, item) => sum + (item.v57 || 0), 0),
    v58: items.reduce((sum, item) => sum + (item.v58 || 0), 0),
    navitas6T: items.reduce((sum, item) => sum + (item.navitas6T || 0), 0),
    kkk55d25b1: items.reduce((sum, item) => sum + (item.kkk55d25b1 || 0), 0),
  });

  const formationSubtotal = calculateSubtotal(data.formation);
  const inspectionSubtotal = calculateSubtotal(data.inspection);
  const otherSubtotal = calculateSubtotal(data.other);

  const grandTotal = {
    v52: formationSubtotal.v52 + inspectionSubtotal.v52 + otherSubtotal.v52,
    v55: formationSubtotal.v55 + inspectionSubtotal.v55 + otherSubtotal.v55,
    v56: formationSubtotal.v56 + inspectionSubtotal.v56 + otherSubtotal.v56,
    v57: formationSubtotal.v57 + inspectionSubtotal.v57 + otherSubtotal.v57,
    v58: formationSubtotal.v58 + inspectionSubtotal.v58 + otherSubtotal.v58,
    navitas6T: formationSubtotal.navitas6T + inspectionSubtotal.navitas6T + otherSubtotal.navitas6T,
    kkk55d25b1: formationSubtotal.kkk55d25b1 + inspectionSubtotal.kkk55d25b1 + otherSubtotal.kkk55d25b1,
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.ncrTable}>
        <thead>
          <tr>
            <th className={styles.thCategory} rowSpan={2}>
              분류
            </th>
            <th className={styles.thNcrType} rowSpan={2}>
              NCR 종류
            </th>
            <th className={styles.thDetails} rowSpan={2}>
              세부사항
            </th>
            <th className={styles.thCode} rowSpan={2}>
              표기
            </th>
            <th className={styles.thProject} colSpan={5}>
              UFC
            </th>
            <th className={styles.thProject} rowSpan={2}>Navitas</th>
            <th className={styles.thProject} rowSpan={2}>55D25B1-KKK55</th>
          </tr>
          <tr>
            <th className={styles.thProject}>5.2</th>
            <th className={styles.thProject}>5.5</th>
            <th className={styles.thProject}>5.6</th>
            <th className={styles.thProject}>5.7</th>
            <th className={styles.thProject}>5.8</th>
          </tr>
        </thead>
        <tbody>
          {/* Formation Section */}
          {data.formation.map((item, idx) => (
            <tr key={`formation-${idx}`}>
              {idx === 0 && (
                <td rowSpan={data.formation.length} className={styles.tdCategory}>
                  Formation
                </td>
              )}
              <td className={styles.tdNcrType}>{item.ncrType}</td>
              <td className={styles.tdDetails}>{item.details}</td>
              <td className={styles.tdCode}>{item.code}</td>
              <td className={styles.tdValue}>{formatValue(item.v52)}</td>
              <td className={styles.tdValue}>{formatValue(item.v55)}</td>
              <td className={styles.tdValue}>{formatValue(item.v56)}</td>
              <td className={styles.tdValue}>{formatValue(item.v57)}</td>
              <td className={styles.tdValue}>{formatValue(item.v58)}</td>
              <td className={styles.tdValue}>{formatValue(item.navitas6T)}</td>
              <td className={styles.tdValue}>{formatValue(item.kkk55d25b1 || 0)}</td>
            </tr>
          ))}

          {/* Inspection Section */}
          {data.inspection.map((item, idx) => (
            <tr key={`inspection-${idx}`}>
              {idx === 0 && (
                <td rowSpan={data.inspection.length} className={styles.tdCategory}>
                  Inspection
                </td>
              )}
              <td className={styles.tdNcrType}>{item.ncrType}</td>
              <td className={styles.tdDetails}>{item.details}</td>
              <td className={styles.tdCode}>{item.code}</td>
              <td className={styles.tdValue}>{formatValue(item.v52)}</td>
              <td className={styles.tdValue}>{formatValue(item.v55)}</td>
              <td className={styles.tdValue}>{formatValue(item.v56)}</td>
              <td className={styles.tdValue}>{formatValue(item.v57)}</td>
              <td className={styles.tdValue}>{formatValue(item.v58)}</td>
              <td className={styles.tdValue}>{formatValue(item.navitas6T)}</td>
              <td className={styles.tdValue}>{formatValue(item.kkk55d25b1 || 0)}</td>
            </tr>
          ))}

          {/* Other Section */}
          {data.other.map((item, idx) => (
            <tr key={`other-${idx}`}>
              {idx === 0 && (
                <td rowSpan={data.other.length} className={styles.tdCategory}>
                  기타
                </td>
              )}
              <td className={styles.tdNcrType}>{item.ncrType}</td>
              <td className={styles.tdDetails}>{item.details}</td>
              <td className={styles.tdCode}>{item.code}</td>
              <td className={styles.tdValue}>{formatValue(item.v52)}</td>
              <td className={styles.tdValue}>{formatValue(item.v55)}</td>
              <td className={styles.tdValue}>{formatValue(item.v56)}</td>
              <td className={styles.tdValue}>{formatValue(item.v57)}</td>
              <td className={styles.tdValue}>{formatValue(item.v58)}</td>
              <td className={styles.tdValue}>{formatValue(item.navitas6T)}</td>
              <td className={styles.tdValue}>{formatValue(item.kkk55d25b1 || 0)}</td>
            </tr>
          ))}

          {/* Total */}
          <tr className={styles.subtotalRow}>
            <td colSpan={4} className={styles.subtotalLabel}>
              총 합
            </td>
            <td className={styles.tdValue}>{formatValue(grandTotal.v52)}</td>
            <td className={styles.tdValue}>{formatValue(grandTotal.v55)}</td>
            <td className={styles.tdValue}>{formatValue(grandTotal.v56)}</td>
            <td className={styles.tdValue}>{formatValue(grandTotal.v57)}</td>
            <td className={styles.tdValue}>{formatValue(grandTotal.v58)}</td>
            <td className={styles.tdValue}>{formatValue(grandTotal.navitas6T)}</td>
            <td className={styles.tdValue}>{formatValue(grandTotal.kkk55d25b1)}</td>
          </tr>

          {/* Grand Total */}
          <tr className={styles.grandTotalRow}>
            <td colSpan={4} className={styles.grandTotalLabel}>
              NCR총합
            </td>
            <td colSpan={7} className={styles.tdValue}>
              {formatValue(
                grandTotal.v52 +
                  grandTotal.v55 +
                  grandTotal.v56 +
                  grandTotal.v57 +
                  grandTotal.v58 +
                  grandTotal.navitas6T +
                  grandTotal.kkk55d25b1
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
