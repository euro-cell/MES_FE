import DistributionChart from '../../lqc/components/formation/DistributionChart';

const BINS: number[] = [];
for (let i = 0; i <= 40; i++) {
  BINS.push(parseFloat((2.160 + i * 0.001).toFixed(3)));
}

interface Ocv3DistChartProps {
  ocv3Values: number[];
  lsl?: number;
}

export default function Ocv3DistChart({ ocv3Values, lsl }: Ocv3DistChartProps) {
  const frequencies = BINS.map((bin, i) => {
    const lower = i === 0 ? -Infinity : BINS[i - 1];
    return ocv3Values.filter(v => v > lower && v <= bin).length;
  });

  const data = BINS.map((bin, i) => ({ x: bin, y: frequencies[i] }));
  const maxFreq = Math.max(...frequencies, 1);
  const yMax = Math.ceil(maxFreq / 50) * 50 + 50;

  return (
    <DistributionChart
      title="출하충전 OCV3 분포"
      data={data}
      xMin={2.18}
      xMax={2.20}
      xStep={0.005}
      yMin={0}
      yMax={yMax}
      yStep={50}
      yLabel="빈도수(EA)"
      xLabel="OCV(V)"
      lsl={lsl}
    />
  );
}
