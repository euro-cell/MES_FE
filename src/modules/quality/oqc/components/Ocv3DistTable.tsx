import NormDistTable from './NormDistTable';

const BINS: number[] = [];
for (let i = 0; i <= 40; i++) {
  BINS.push(parseFloat((2.160 + i * 0.001).toFixed(3)));
}

interface Ocv3DistTableProps {
  ocv3Values: number[];
}

export default function Ocv3DistTable({ ocv3Values }: Ocv3DistTableProps) {
  return (
    <NormDistTable
      title="OCV3 정규분포"
      bins={BINS}
      binWidth={0.001}
      values={ocv3Values}
      binDecimals={3}
    />
  );
}
