import DistributionChart from '../../../lqc/components/formation/DistributionChart';

const BINS: number[] = [];
for (let i = 0; i <= 40; i++) {
  BINS.push(parseFloat((2.160 + i * 0.001).toFixed(3)));
}

interface Ocv4DistChartProps {
  ocv4Values: number[];
  lsl?: number;
  usl?: number;
}

export default function Ocv4DistChart({ ocv4Values, lsl, usl }: Ocv4DistChartProps) {
  const frequencies = BINS.map((bin, i) => {
    const lower = i === 0 ? -Infinity : BINS[i - 1];
    return ocv4Values.filter(v => v > lower && v <= bin).length;
  });

  const data = BINS.map((bin, i) => ({ x: bin, y: frequencies[i] }));
  const maxFreq = Math.max(...frequencies, 1);
  const yMax = Math.ceil(maxFreq / 50) * 50 + 50;

  return (
    <DistributionChart
      title="출하보관(1개월) OCV4 분포"
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
      usl={usl}
    />
  );
}
