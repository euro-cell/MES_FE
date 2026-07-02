import DistributionChart from '../../../lqc/components/formation/DistributionChart';

const BINS = [
  35.0, 35.2, 35.4, 35.6, 35.9, 36.0, 36.2, 36.4, 36.6, 36.8,
  37.0, 37.2, 37.4, 37.6, 37.8, 38.0, 38.2, 38.4, 38.6, 38.8,
  39.0, 39.2, 39.4, 39.6, 39.8, 40.0, 40.2, 40.4, 40.6, 40.8,
  41.0, 41.2, 41.4, 41.6, 41.8, 42.0, 42.2, 42.4, 42.6, 42.8,
  43.0,
];

const BIN_WIDTH = 0.2;

function normPdf(x: number, mean: number, stddev: number): number {
  const coeff = 1 / (stddev * Math.sqrt(2 * Math.PI));
  return coeff * Math.exp(-0.5 * ((x - mean) / stddev) ** 2);
}

function stdevP(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length);
}

interface CapacityNormChartProps {
  capacities: number[];
  lsl?: number;
}

export default function CapacityNormChart({ capacities, lsl }: CapacityNormChartProps) {
  const mean = capacities.length
    ? capacities.reduce((a, b) => a + b, 0) / capacities.length
    : 0;
  const stddev = stdevP(capacities);

  const data = BINS.map(bin => ({
    x: bin,
    y: normPdf(bin, mean, stddev) * BIN_WIDTH,
  }));

  return (
    <DistributionChart
      title="Standard Capacity 정규분포"
      data={data}
      xMin={35}
      xMax={43}
      xStep={1}
      yMin={0}
      yMax={0.25}
      yStep={0.05}
      yLabel="확률밀도"
      xLabel="용량(Ah)"
      lsl={lsl}
    />
  );
}
