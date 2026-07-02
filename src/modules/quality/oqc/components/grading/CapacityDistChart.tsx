import DistributionChart from '../../../lqc/components/formation/DistributionChart';

const BINS = [
  35.0, 35.2, 35.4, 35.6, 35.9, 36.0, 36.2, 36.4, 36.6, 36.8,
  37.0, 37.2, 37.4, 37.6, 37.8, 38.0, 38.2, 38.4, 38.6, 38.8,
  39.0, 39.2, 39.4, 39.6, 39.8, 40.0, 40.2, 40.4, 40.6, 40.8,
  41.0, 41.2, 41.4, 41.6, 41.8, 42.0, 42.2, 42.4, 42.6, 42.8,
  43.0,
];

interface CapacityDistChartProps {
  capacities: number[];
  lsl?: number;
}

export default function CapacityDistChart({ capacities, lsl }: CapacityDistChartProps) {
  const frequencies = BINS.map((bin, i) => {
    const lower = i === 0 ? -Infinity : BINS[i - 1];
    return capacities.filter(v => v > lower && v <= bin).length;
  });

  const data = BINS.map((bin, i) => ({ x: bin, y: frequencies[i] }));
  const maxFreq = Math.max(...frequencies, 1);
  const yMax = Math.ceil(maxFreq / 20) * 20 + 20;

  return (
    <DistributionChart
      title="Standard Capacity 분포"
      data={data}
      xMin={35}
      xMax={43}
      xStep={1}
      yMin={0}
      yMax={yMax}
      yStep={20}
      yLabel="빈도수(EA)"
      xLabel="용량(Ah)"
      lsl={lsl}
    />
  );
}
