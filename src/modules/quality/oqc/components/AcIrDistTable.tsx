import NormDistTable from './NormDistTable';

const BINS = [
  0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42, 0.44, 0.46, 0.48,
  0.50, 0.52, 0.54, 0.56, 0.58, 0.60, 0.62, 0.64, 0.66, 0.68,
  0.70, 0.72, 0.74, 0.76, 0.78, 0.80, 0.82, 0.84, 0.86, 0.88,
  0.90, 0.92, 0.94, 0.96, 0.98, 1.00, 1.02, 1.04, 1.06, 1.08,
  1.10,
];

interface AcIrDistTableProps {
  acIrValues: number[];
}

export default function AcIrDistTable({ acIrValues }: AcIrDistTableProps) {
  return (
    <NormDistTable
      title="AC-IR 정규분포"
      bins={BINS}
      binWidth={0.02}
      values={acIrValues}
    />
  );
}
