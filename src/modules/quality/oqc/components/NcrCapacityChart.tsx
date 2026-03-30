import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface NcrCapacityChartProps {
  grades: { BA: number; BB: number; BC: number; C: number };
}

export default function NcrCapacityChart({ grades }: NcrCapacityChartProps) {
  const values = [grades.BA, grades.BB, grades.BC, grades.C];
  const maxVal = Math.max(...values, 1);
  const yMax = Math.ceil(maxVal / 1) + 1;

  return (
    <div style={{ height: 320, width: '100%' }}>
      <Bar
        data={{
          labels: ['BA', 'BB', 'BC', 'C'],
          datasets: [
            {
              data: values,
              backgroundColor: 'rgba(0, 112, 192, 0.6)',
              borderColor: '#0070C0',
              borderWidth: 1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: '기준용량 NCR 결과', font: { size: 13 } },
            legend: { display: false },
          },
          scales: {
            x: { title: { display: false } },
            y: {
              min: 0,
              max: yMax,
              ticks: { stepSize: 1 },
              title: { display: true, text: '수량(ea)' },
            },
          },
        }}
      />
    </div>
  );
}
