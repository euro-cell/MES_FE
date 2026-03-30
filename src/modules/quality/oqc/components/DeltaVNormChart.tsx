import DistributionChart from '../../lqc/components/formation/DistributionChart';

const BINS = [
  0.0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4, 2.7,
  3.0, 3.3, 3.6, 3.9, 4.2, 4.5, 4.8, 5.1, 5.4, 5.7,
  6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0,
];

const BIN_WIDTH = 0.3;

function normPdf(x: number, mean: number, stddev: number): number {
  const coeff = 1 / (stddev * Math.sqrt(2 * Math.PI));
  return coeff * Math.exp(-0.5 * ((x - mean) / stddev) ** 2);
}

function stdevP(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length);
}

interface DeltaVNormChartProps {
  deltaVValues: number[];
  usl?: number;
}

export default function DeltaVNormChart({ deltaVValues, usl }: DeltaVNormChartProps) {
  const mean = deltaVValues.length
    ? deltaVValues.reduce((a, b) => a + b, 0) / deltaVValues.length
    : 0;
  const stddev = stdevP(deltaVValues);

  const densities = BINS.map(bin => normPdf(bin, mean, stddev) * BIN_WIDTH);
  const maxDensity = Math.max(...densities);
  const yMax = Math.ceil(maxDensity / 0.01) * 0.01 + 0.01;
  const data = BINS.map((bin, i) => ({ x: bin, y: densities[i] }));

  return (
    <DistributionChart
      title="장기보관 △V 정규분포"
      data={data}
      xMin={0}
      xMax={10}
      xStep={1}
      yMin={0}
      yMax={yMax}
      yStep={0.01}
      yLabel="확률밀도"
      xLabel="△V(mV)"
      usl={usl}
      uslColor="#0000FF"
    />
  );
}
