import NormDistTable from './NormDistTable';

const BINS: number[] = [];
for (let i = 0; i <= 40; i++) {
  BINS.push(parseFloat((2.160 + i * 0.001).toFixed(3)));
}

interface Ocv4DistTableProps {
  ocv4Values: number[];
}

export default function Ocv4DistTable({ ocv4Values }: Ocv4DistTableProps) {
  return (
    <NormDistTable
      title="출하 OCV4 정규분포"
      bins={BINS}
      binWidth={0.001}
      values={ocv4Values}
      binDecimals={3}
    />
  );
}
