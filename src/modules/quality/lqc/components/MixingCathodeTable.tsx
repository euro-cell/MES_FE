import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

interface BinderRow {
  no: number;
  manufactureDate: string;
  lotNo: string;
  solidContent1: number | null;
  solidContent2: number | null;
  solidContent3: number | null;
  solidContentAvg: number | null;
  viscosity: number | null;
}

interface SlurryRow {
  no: number;
  manufactureDate: string;
  batchLot: string;
  solidContent1: number | null;
  solidContent2: number | null;
  solidContent3: number | null;
  solidContentAvg: number | null;
  viscosity: number | null;
  particleSize: number | null;
}

export default function MixingCathodeTable() {
  // 임시 데이터 (나중에 API 연결)
  const binderData: BinderRow[] = [
    {
      no: 1,
      manufactureDate: '2025.12.01',
      lotNo: '',
      solidContent1: 5.6,
      solidContent2: 5.8,
      solidContent3: null,
      solidContentAvg: 5.7,
      viscosity: 3510,
    },
    { no: 2, manufactureDate: '', lotNo: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null },
    { no: 3, manufactureDate: '', lotNo: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null },
    { no: 4, manufactureDate: '', lotNo: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null },
    { no: 5, manufactureDate: '', lotNo: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null },
  ];

  const slurryData: SlurryRow[] = [
    {
      no: 1,
      manufactureDate: '2025.12.02',
      batchLot: 'DL02C11',
      solidContent1: 59.9,
      solidContent2: 59.8,
      solidContent3: 59.8,
      solidContentAvg: 59.8,
      viscosity: 7160,
      particleSize: 28,
    },
    { no: 2, manufactureDate: '', batchLot: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null, particleSize: null },
    { no: 3, manufactureDate: '', batchLot: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null, particleSize: null },
    { no: 4, manufactureDate: '', batchLot: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null, particleSize: null },
    { no: 5, manufactureDate: '', batchLot: '', solidContent1: null, solidContent2: null, solidContent3: null, solidContentAvg: null, viscosity: null, particleSize: null },
  ];

  // Binder 차트 데이터
  const binderChartData = {
    labels: binderData.map(row => row.no.toString()),
    datasets: [
      {
        type: 'bar' as const,
        label: '고형분',
        data: binderData.map(row => row.solidContentAvg),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
        order: 2,
      },
      {
        type: 'line' as const,
        label: '점도',
        data: binderData.map(row => row.viscosity),
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 1)',
        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
        pointBorderColor: 'rgba(255, 193, 7, 1)',
        pointRadius: 6,
        yAxisID: 'y',
        order: 1,
      },
    ],
  };

  // Slurry 차트 데이터
  const slurryChartData = {
    labels: slurryData.map(row => row.no.toString()),
    datasets: [
      {
        type: 'bar' as const,
        label: '고형분',
        data: slurryData.map(row => row.solidContentAvg),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
        order: 3,
      },
      {
        type: 'line' as const,
        label: '점도',
        data: slurryData.map(row => row.viscosity),
        borderColor: 'rgba(255, 193, 7, 1)',
        backgroundColor: 'rgba(255, 193, 7, 1)',
        pointBackgroundColor: 'rgba(255, 193, 7, 1)',
        pointBorderColor: 'rgba(255, 193, 7, 1)',
        pointRadius: 6,
        yAxisID: 'y',
        order: 1,
      },
      {
        type: 'line' as const,
        label: '입도',
        data: slurryData.map(row => row.particleSize),
        borderColor: 'rgba(76, 175, 80, 1)',
        backgroundColor: 'rgba(76, 175, 80, 1)',
        pointBackgroundColor: 'rgba(76, 175, 80, 1)',
        pointBorderColor: 'rgba(76, 175, 80, 1)',
        pointStyle: 'triangle',
        pointRadius: 6,
        yAxisID: 'y1',
        order: 2,
      },
    ],
  };

  // Binder 차트 옵션
  const binderChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: '양극 바인더용액 제조 결과',
        font: { size: 14 },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: '점도(cps)',
        },
        min: 0,
        max: 4000,
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: '고형분(%)',
        },
        min: 0,
        max: 6,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Slurry 차트 옵션
  const slurryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: '양극 슬러리 제조 결과',
        font: { size: 14 },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: '점도(cps)',
        },
        min: 0,
        max: 8000,
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: '고형분(%)/입도(㎛)',
        },
        min: 0,
        max: 70,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className={styles.tableContainer}>
      {/* Binder Solution Mixing 검사 */}
      <div className={styles.tableSection}>
        <h3 className={styles.tableTitle}>Binder Solution Mixing 검사 (양극)</h3>
        <div className={styles.tableChartWrapper}>
          <div className={styles.tableWrapper}>
            <table className={styles.lqcTable}>
              <thead>
                <tr>
                  <th rowSpan={2}>No.</th>
                  <th rowSpan={2}>제조일자</th>
                  <th rowSpan={2}>Lot no.</th>
                  <th colSpan={4}>고형분(%)</th>
                  <th rowSpan={2}>점도(cps)</th>
                </tr>
                <tr>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>평균</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.specRow}>
                  <td colSpan={3}>규격</td>
                  <td colSpan={4}>6.00±0.18</td>
                  <td>1,200±3,000</td>
                </tr>
                {binderData.map(row => (
                  <tr key={row.no}>
                    <td>{row.no}</td>
                    <td>{row.manufactureDate}</td>
                    <td>{row.lotNo}</td>
                    <td>{row.solidContent1 ?? ''}</td>
                    <td>{row.solidContent2 ?? ''}</td>
                    <td>{row.solidContent3 ?? ''}</td>
                    <td>{row.solidContentAvg ?? ''}</td>
                    <td>{row.viscosity?.toLocaleString() ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.chartWrapper}>
            <Bar data={binderChartData as any} options={binderChartOptions} />
          </div>
        </div>
      </div>

      {/* Slurry Mixing 검사 */}
      <div className={styles.tableSection}>
        <h3 className={styles.tableTitle}>Slurry Mixing 검사 (양극)</h3>
        <div className={styles.tableChartWrapper}>
          <div className={styles.tableWrapper}>
            <table className={styles.lqcTable}>
              <thead>
                <tr>
                  <th rowSpan={2}>No.</th>
                  <th rowSpan={2}>제조일자</th>
                  <th rowSpan={2}>Batch Lot.</th>
                  <th colSpan={4}>고형분(%)</th>
                  <th rowSpan={2}>점도(cps)</th>
                  <th rowSpan={2}>입도(㎛)</th>
                </tr>
                <tr>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>평균</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.specRow}>
                  <td colSpan={3}>규격</td>
                  <td colSpan={4}>59.5±1.7</td>
                  <td>7,000±3,000</td>
                  <td>≤28</td>
                </tr>
                {slurryData.map(row => (
                  <tr key={row.no}>
                    <td>{row.no}</td>
                    <td>{row.manufactureDate}</td>
                    <td>{row.batchLot}</td>
                    <td>{row.solidContent1 ?? ''}</td>
                    <td>{row.solidContent2 ?? ''}</td>
                    <td>{row.solidContent3 ?? ''}</td>
                    <td>{row.solidContentAvg ?? ''}</td>
                    <td>{row.viscosity?.toLocaleString() ?? ''}</td>
                    <td>{row.particleSize ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.chartWrapper}>
            <Bar data={slurryChartData as any} options={slurryChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
