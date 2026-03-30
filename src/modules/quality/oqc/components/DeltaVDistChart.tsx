import DistributionChart from '../../lqc/components/formation/DistributionChart';

const BINS = [
  0.0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4, 2.7,
  3.0, 3.3, 3.6, 3.9, 4.2, 4.5, 4.8, 5.1, 5.4, 5.7,
  6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5,
  11.0, 11.5, 12.0, 12.5, 13.0, 13.5, 14.0, 15.0, 16.0, 17.0, 18.0,
];

interface DeltaVDistChartProps {
  deltaVValues: number[];
  usl?: number;
}

export default function DeltaVDistChart({ deltaVValues, usl }: DeltaVDistChartProps) {
  const frequencies = BINS.map((bin, i) => {
    const lower = i === 0 ? -Infinity : BINS[i - 1];
    return deltaVValues.filter(v => v > lower && v <= bin).length;
  });

  const data = BINS.map((bin, i) => ({ x: bin, y: frequencies[i] }));
  const maxFreq = Math.max(...frequencies, 1);
  const yMax = Math.ceil(maxFreq / 20) * 20 + 20;

  return (
    <DistributionChart
      title="출하보관(1개월) △V 분포"
      data={data}
      xMin={0}
      xMax={10}
      xStep={1}
      yMin={0}
      yMax={yMax}
      yStep={20}
      yLabel="빈도수(EA)"
      xLabel="△V(mV)"
      usl={usl}
      uslColor="#0000FF"
    />
  );
}
