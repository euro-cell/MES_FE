import styles from '../../../../../styles/quality/oqc/OQCTable.module.css';
import type { GradingCell } from '../../../../../api/quality/OQCService';

interface NcrGradingTableProps {
  rows: GradingCell[];
  calcDeltaV: (ocv3: number, ocv4: number | null) => number | null;
}

interface NcrTableData {
  title: string;
  grades: { BA: number; BB: number; BC: number; C: number };
}

const thStyle: React.CSSProperties = {
  background: '#215C98',
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center',
};

function NcrTable({ data }: { data: NcrTableData }) {
  return (
    <table className={styles.lqcTable} style={{ minWidth: 280, marginBottom: 0 }}>
      <thead>
        <tr>
          <th colSpan={4} style={thStyle}>{data.title}</th>
        </tr>
        <tr>
          <th style={thStyle}>BA</th>
          <th style={thStyle}>BB</th>
          <th style={thStyle}>BC</th>
          <th style={thStyle}>C</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ textAlign: 'center' }}>{data.grades.BA}</td>
          <td style={{ textAlign: 'center' }}>{data.grades.BB}</td>
          <td style={{ textAlign: 'center' }}>{data.grades.BC}</td>
          <td style={{ textAlign: 'center' }}>{data.grades.C}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default function NcrGradingTable({ rows, calcDeltaV }: NcrGradingTableProps) {
  // NCR1: 기준용량
  const ncr1: NcrTableData = {
    title: 'NCR1_기준용량',
    grades: {
      BA: rows.filter(r => r.capacity > 37.2 && r.capacity <= 37.8).length,
      BB: rows.filter(r => r.capacity > 36.6 && r.capacity <= 37.2).length,
      BC: rows.filter(r => r.capacity > 35.9 && r.capacity <= 36.6).length,
      C:  rows.filter(r => r.capacity <= 35.9).length,
    },
  };

  // NCR2: OCV3
  const ncr2: NcrTableData = {
    title: 'NCR2_출하충전 OCV3',
    grades: {
      BA: rows.filter(r => r.ocv3 > 2.189 && r.ocv3 <= 2.190).length,
      BB: rows.filter(r => r.ocv3 > 2.180 && r.ocv3 <= 2.189).length,
      BC: rows.filter(r => r.ocv3 > 2.160 && r.ocv3 <= 2.180).length,
      C:  rows.filter(r => r.ocv3 <= 2.160).length,
    },
  };

  // NCR3: △V
  const ncr3: NcrTableData = {
    title: 'NCR3_보관후출하 OCV4 △V',
    grades: {
      BA: rows.filter(r => { const dv = calcDeltaV(r.ocv3, r.ocv4);  return dv !== null && dv > 3.0  && dv <= 10.0; }).length,
      BB: rows.filter(r => { const dv = calcDeltaV(r.ocv3, r.ocv4);  return dv !== null && dv > 10.0 && dv <= 14.0; }).length,
      BC: rows.filter(r => { const dv = calcDeltaV(r.ocv3, r.ocv4);  return dv !== null && dv > 14.0 && dv <= 18.0; }).length,
      C:  rows.filter(r => { const dv = calcDeltaV(r.ocv3, r.ocv4);  return dv !== null && dv > 18.0; }).length,
    },
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <NcrTable data={ncr1} />
        <NcrTable data={ncr2} />
        <NcrTable data={ncr3} />
      </div>
    </div>
  );
}
