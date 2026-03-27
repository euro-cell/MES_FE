import { useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  getOQCSpec,
  saveOQCSpec,
  type GradingCell,
  type SpecValue,
} from '../../../../api/quality/OQCService';
import styles from '../../../../styles/quality/oqc/OQCTable.module.css';
import SpecEditModal from '../../lqc/components/common/SpecEditModal';

const ROW_HEIGHT = 32;
const TABLE_HEIGHT = 600;

// ── 목데이터 ──────────────────────────────────────────────────────────────────
const MOCK_ROWS: GradingCell[] = [
  { lotNo: 'O1DF130001', capacity: 39.1020, acIr: 0.637, ocv3: 2.1960, ocv4: 2.1930 },
  { lotNo: 'O1DF130002', capacity: 39.0825, acIr: 0.626, ocv3: 2.1958, ocv4: 2.1931 },
  { lotNo: 'O1DF130003', capacity: 39.0683, acIr: 0.613, ocv3: 2.1953, ocv4: 2.1929 },
  { lotNo: 'O1DF130004', capacity: 38.9703, acIr: 0.617, ocv3: 2.1957, ocv4: 2.1929 },
  { lotNo: 'O1DF130005', capacity: 39.1503, acIr: 0.611, ocv3: 2.1954, ocv4: 2.1935 },
  { lotNo: 'O1DF130006', capacity: 39.3491, acIr: 0.635, ocv3: 2.1949, ocv4: 2.1931 },
  { lotNo: 'O1DF130007', capacity: 39.1634, acIr: 0.600, ocv3: 2.1954, ocv4: 2.1928 },
  { lotNo: 'O1DF130008', capacity: 39.3449, acIr: 0.603, ocv3: 2.1955, ocv4: 2.1930 },
  { lotNo: 'O1DF130009', capacity: 38.0363, acIr: 0.657, ocv3: 2.1974, ocv4: 2.1924 },
  { lotNo: 'O1DF130010', capacity: 38.2484, acIr: 0.660, ocv3: 2.1974, ocv4: 2.1935 },
  { lotNo: 'O1DF130011', capacity: 38.1559, acIr: 0.642, ocv3: 2.1970, ocv4: 2.1935 },
  { lotNo: 'O1DF130012', capacity: 38.0803, acIr: 0.650, ocv3: 2.1972, ocv4: 2.1917 },
  { lotNo: 'O1DF130013', capacity: 38.0746, acIr: 0.642, ocv3: 2.1970, ocv4: 2.1915 },
  { lotNo: 'O1DF130014', capacity: 38.0460, acIr: 0.655, ocv3: 2.1969, ocv4: 2.1927 },
  { lotNo: 'O1DF130015', capacity: 38.0062, acIr: 0.656, ocv3: 2.1966, ocv4: 2.1930 },
  { lotNo: 'O1DF130016', capacity: 38.0136, acIr: 0.675, ocv3: 2.1977, ocv4: 2.1928 },
  { lotNo: 'O1DF130017', capacity: 37.7670, acIr: 0.615, ocv3: 2.1957, ocv4: 2.1929 },
  { lotNo: 'O1DF130018', capacity: 37.8630, acIr: 0.616, ocv3: 2.1956, ocv4: 2.1863 },
  { lotNo: 'O1DF130019', capacity: 37.8164, acIr: 0.620, ocv3: 2.1956, ocv4: 2.1926 },
  { lotNo: 'O1DF130020', capacity: 37.8526, acIr: 0.611, ocv3: 2.1956, ocv4: 2.1931 },
  { lotNo: 'O1DF130021', capacity: 37.8736, acIr: 0.627, ocv3: 2.1960, ocv4: 2.1929 },
  { lotNo: 'O1DF130022', capacity: 37.8129, acIr: 0.613, ocv3: 2.1957, ocv4: 2.1928 },
  { lotNo: 'O1DF130023', capacity: 37.8534, acIr: 0.600, ocv3: 2.1955, ocv4: 2.1933 },
  { lotNo: 'O1DF130024', capacity: 37.9074, acIr: 0.614, ocv3: 2.1956, ocv4: 2.1891 },
  { lotNo: 'O1DF130025', capacity: 38.0361, acIr: 0.625, ocv3: 2.1951, ocv4: 2.1897 },
  { lotNo: 'O1DF130027', capacity: 38.0819, acIr: 0.622, ocv3: 2.1961, ocv4: 2.1903 },
  { lotNo: 'O1DF130028', capacity: 38.0890, acIr: 0.616, ocv3: 2.1962, ocv4: 2.1921 },
  { lotNo: 'O1DF130029', capacity: 38.0464, acIr: 0.604, ocv3: 2.1955, ocv4: 2.1909 },
  { lotNo: 'O1DF130030', capacity: 38.1248, acIr: 0.614, ocv3: 2.1959, ocv4: 2.1925 },
  { lotNo: 'O1DF130031', capacity: 38.1512, acIr: 0.610, ocv3: 2.1956, ocv4: 2.1927 },
  { lotNo: 'O1DF130032', capacity: 38.0646, acIr: 0.622, ocv3: 2.1957, ocv4: 2.1929 },
  { lotNo: 'O1DF130033', capacity: 38.0382, acIr: 0.627, ocv3: 2.1961, ocv4: 2.1927 },
  { lotNo: 'O1DF130034', capacity: 38.8609, acIr: 0.605, ocv3: 2.1957, ocv4: 2.1932 },
  { lotNo: 'O1DF130035', capacity: 38.9393, acIr: 0.641, ocv3: 2.1941, ocv4: 2.1931 },
  { lotNo: 'O1DF130036', capacity: 38.9864, acIr: 0.600, ocv3: 2.1955, ocv4: 2.1920 },
  { lotNo: 'O1DF130037', capacity: 39.0634, acIr: 0.614, ocv3: 2.1960, ocv4: 2.1931 },
  { lotNo: 'O1DF130038', capacity: 38.8757, acIr: 0.624, ocv3: 2.1956, ocv4: 2.1927 },
  { lotNo: 'O1DF130039', capacity: 38.9082, acIr: 0.647, ocv3: 2.1955, ocv4: 2.1923 },
  { lotNo: 'O1DF130040', capacity: 39.1219, acIr: 0.616, ocv3: 2.1961, ocv4: 2.1928 },
  { lotNo: 'O1DF130042', capacity: 39.0975, acIr: 0.622, ocv3: 2.1950, ocv4: 2.1934 },
  { lotNo: 'O1DG150053', capacity: 39.1386, acIr: 0.584, ocv3: 2.1949, ocv4: 2.1923 },
  { lotNo: 'O1DG150054', capacity: 35.5154, acIr: 0.640, ocv3: 2.1951, ocv4: 2.1924 },
  { lotNo: 'O1DG150057', capacity: 39.2903, acIr: 0.615, ocv3: 2.1948, ocv4: 2.1925 },
  { lotNo: 'O1DG150065', capacity: 38.9379, acIr: 0.609, ocv3: 2.1953, ocv4: 2.1927 },
  { lotNo: 'O1DG150068', capacity: 38.9800, acIr: 0.617, ocv3: 2.1961, ocv4: 2.1940 },
  { lotNo: 'O1DG150069', capacity: 38.9478, acIr: 0.623, ocv3: 2.1962, ocv4: 2.1940 },
  { lotNo: 'O1DG150071', capacity: 39.0495, acIr: 0.639, ocv3: 2.1960, ocv4: 2.1940 },
  { lotNo: 'O1DG150076', capacity: 38.6051, acIr: 0.590, ocv3: 2.1964, ocv4: 2.1939 },
  { lotNo: 'O1DG150078', capacity: 38.5003, acIr: 0.577, ocv3: 2.1968, ocv4: 2.1931 },
  { lotNo: 'O1DG150080', capacity: 39.0572, acIr: 0.627, ocv3: 2.1961, ocv4: 2.1939 },
  { lotNo: 'O1DG150081', capacity: 39.0593, acIr: 0.569, ocv3: 2.1964, ocv4: 2.1939 },
  { lotNo: 'O1DG150083', capacity: 39.0829, acIr: 0.585, ocv3: 2.1959, ocv4: 2.1935 },
  { lotNo: 'O1DG150085', capacity: 38.9562, acIr: 0.589, ocv3: 2.1963, ocv4: 2.1942 },
  { lotNo: 'O1DG150087', capacity: 38.7252, acIr: 0.608, ocv3: 2.1957, ocv4: 2.1937 },
  { lotNo: 'O1DG150089', capacity: 38.5951, acIr: 0.613, ocv3: 2.1962, ocv4: 2.1938 },
  { lotNo: 'O1DG150099', capacity: 38.9495, acIr: 0.648, ocv3: 2.1960, ocv4: 2.1936 },
  { lotNo: 'O1DG150104', capacity: 38.9593, acIr: 0.639, ocv3: 2.1953, ocv4: 2.1929 },
  { lotNo: 'O1DG150108', capacity: 39.0324, acIr: 0.653, ocv3: 2.1947, ocv4: 2.1922 },
  { lotNo: 'O1DG150110', capacity: 39.0437, acIr: 0.628, ocv3: 2.1957, ocv4: 2.1911 },
  { lotNo: 'O1DG150111', capacity: 39.1732, acIr: 0.622, ocv3: 2.1950, ocv4: 2.1926 },
  { lotNo: 'O1DG150129', capacity: 38.6308, acIr: 0.607, ocv3: 2.1966, ocv4: 2.1939 },
  { lotNo: 'O1DG150131', capacity: 39.0076, acIr: 0.619, ocv3: 2.1956, ocv4: 2.1931 },
  { lotNo: 'O1DG150132', capacity: 38.9873, acIr: 0.602, ocv3: 2.1961, ocv4: 2.1935 },
  { lotNo: 'O1DG150134', capacity: 38.9537, acIr: 0.616, ocv3: 2.1963, ocv4: 2.1939 },
  { lotNo: 'O1DG150135', capacity: 39.0451, acIr: 0.654, ocv3: 2.1951, ocv4: 2.1927 },
  { lotNo: 'O1DG150139', capacity: 39.0801, acIr: 0.650, ocv3: 2.1955, ocv4: 2.1930 },
  { lotNo: 'O1DG150140', capacity: 39.1999, acIr: 0.736, ocv3: 2.1947, ocv4: 2.1922 },
  { lotNo: 'O1DG150142', capacity: 39.1177, acIr: 0.733, ocv3: 2.1942, ocv4: 2.1919 },
  { lotNo: 'O1DG150143', capacity: 38.8973, acIr: 0.716, ocv3: 2.1950, ocv4: 2.1926 },
  { lotNo: 'O1DG150144', capacity: 39.2263, acIr: 0.597, ocv3: 2.1952, ocv4: 2.1931 },
  { lotNo: 'O1DG150145', capacity: 39.2095, acIr: 0.619, ocv3: 2.1952, ocv4: 2.1927 },
  { lotNo: 'O1DG150146', capacity: 39.3395, acIr: 0.607, ocv3: 2.1948, ocv4: 2.1927 },
  { lotNo: 'O1DG150147', capacity: 39.3534, acIr: 0.612, ocv3: 2.1943, ocv4: 2.1930 },
  { lotNo: 'O1DG150148', capacity: 39.1322, acIr: 0.610, ocv3: 2.1944, ocv4: 2.1924 },
  { lotNo: 'O1DG150149', capacity: 39.0912, acIr: 0.636, ocv3: 2.1942, ocv4: 2.1929 },
  { lotNo: 'O1DG150150', capacity: 39.1139, acIr: 0.724, ocv3: 2.1934, ocv4: 2.1919 },
  { lotNo: 'O1DG150151', capacity: 38.9530, acIr: 0.732, ocv3: 2.1938, ocv4: 2.1939 },
  { lotNo: 'O1DG150152', capacity: 38.9220, acIr: 0.745, ocv3: 2.1938, ocv4: 2.1941 },
  { lotNo: 'O1DG150153', capacity: 39.0491, acIr: 0.754, ocv3: 2.1942, ocv4: 2.1913 },
  { lotNo: 'O1DG150154', capacity: 39.0933, acIr: 0.728, ocv3: 2.1940, ocv4: 2.1922 },
  { lotNo: 'O1DG150155', capacity: 38.9380, acIr: 0.605, ocv3: 2.1950, ocv4: 2.1930 },
  { lotNo: 'O1DG150156', capacity: 38.7961, acIr: 0.721, ocv3: 2.1948, ocv4: 2.1927 },
  { lotNo: 'O1DG150157', capacity: 39.1175, acIr: 0.758, ocv3: 2.1955, ocv4: 2.1927 },
  { lotNo: 'O1DG150158', capacity: 39.3653, acIr: 0.774, ocv3: 2.1956, ocv4: 2.1919 },
  { lotNo: 'O1DG150159', capacity: 39.4073, acIr: 0.624, ocv3: 2.1961, ocv4: 2.1924 },
  { lotNo: 'O1DG150160', capacity: 39.3990, acIr: 0.631, ocv3: 2.1964, ocv4: 2.1923 },
  { lotNo: 'O1DG150161', capacity: 39.3774, acIr: 0.621, ocv3: 2.1963, ocv4: 2.1925 },
  { lotNo: 'O1DG150162', capacity: 39.4138, acIr: 0.676, ocv3: 2.1956, ocv4: 2.1887 },
  { lotNo: 'O1DG150163', capacity: 39.3708, acIr: 0.789, ocv3: 2.1944, ocv4: 2.1925 },
  { lotNo: 'O1DG150164', capacity: 39.4339, acIr: 0.758, ocv3: 2.1945, ocv4: 2.1930 },
  { lotNo: 'O1DG150165', capacity: 39.4848, acIr: 0.736, ocv3: 2.1941, ocv4: 2.1909 },
  { lotNo: 'O1DG150166', capacity: 39.2336, acIr: 0.742, ocv3: 2.1926, ocv4: 2.1910 },
  { lotNo: 'O1DG150167', capacity: 39.2203, acIr: 0.752, ocv3: 2.1950, ocv4: 2.1935 },
  { lotNo: 'O1DG150168', capacity: 39.3715, acIr: 0.735, ocv3: 2.1940, ocv4: 2.1925 },
  { lotNo: 'O1DG150169', capacity: 39.4900, acIr: 0.749, ocv3: 2.1942, ocv4: 2.1927 },
  { lotNo: 'O1DG150172', capacity: 39.4236, acIr: 0.758, ocv3: 2.1946, ocv4: 2.1929 },
  { lotNo: 'O1DG150173', capacity: 39.4264, acIr: 0.751, ocv3: 2.1936, ocv4: 2.1921 },
  { lotNo: 'O1DG150174', capacity: 39.4315, acIr: 0.774, ocv3: 2.1932, ocv4: 2.1921 },
  { lotNo: 'O1DG150176', capacity: 39.4225, acIr: 0.714, ocv3: 2.1942, ocv4: 2.1930 },
  { lotNo: 'O1DG150177', capacity: 39.5414, acIr: 0.748, ocv3: 2.1935, ocv4: 2.1921 },
];

const SPEC_FIELDS = [
  { key: 'capacity', label: '기준용량',             type: 'min-only'  as const, unit: 'Ah' },
  { key: 'acIr',     label: 'AC-IR',                type: 'max-only'  as const, unit: 'mΩ' },
  { key: 'ocv3',     label: 'OCV3 (출하충전)',       type: 'min-only'  as const, unit: 'V'  },
  { key: 'ocv4',     label: 'OCV4 (장기보관)',       type: 'range'     as const, unit: 'V'  },
  { key: 'deltaV',   label: '△V',                   type: 'max-only'  as const, unit: 'mV' },
];

const isOutOfSpec = (val: number | null, lsl?: number, usl?: number): boolean => {
  if (val === null) return false;
  if (lsl !== undefined && val < lsl) return true;
  if (usl !== undefined && val > usl) return true;
  return false;
};

const stdevP = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length);
};

const formatSpec = (spec: SpecValue | undefined): string => {
  if (!spec) return '-';
  if (spec.min !== undefined && spec.max !== undefined) return `${spec.min} ~ ${spec.max}`;
  if (spec.min !== undefined) return `≥${spec.min}`;
  if (spec.max !== undefined) return `≤${spec.max}`;
  return '-';
};

interface GradingTableProps {
  projectId: number;
}

export default function GradingTable({ projectId }: GradingTableProps) {
  const [rows] = useState<GradingCell[]>(MOCK_ROWS);
  const [specs, setSpecs] = useState<Record<string, SpecValue>>({});
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const specsData = await getOQCSpec(projectId, 'GRADING');
        if (specsData.length > 0) setSpecs(specsData[0].specs);
      } catch {
        // fallback to defaults
      }
    };
    loadSpecs();
  }, [projectId]);

  const handleSaveSpec = async (newSpecs: Record<string, SpecValue>) => {
    try {
      await saveOQCSpec(projectId, 'GRADING', 'GRADING', newSpecs);
      setSpecs(newSpecs);
    } catch (err) {
      console.error('Failed to save spec:', err);
    }
  };

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const hasData = rows.length > 0;

  const calcDeltaV = (ocv3: number, ocv4: number | null): number | null =>
    ocv4 !== null ? Math.round((ocv3 - ocv4) * 10000) / 10 : null;

  const capacityNums = rows.map(r => r.capacity);
  const acIrNums     = rows.map(r => r.acIr);
  const ocv3Nums     = rows.map(r => r.ocv3);
  const ocv4Nums     = rows.filter(r => r.ocv4 !== null).map(r => r.ocv4 as number);
  const deltaVNums   = rows.map(r => calcDeltaV(r.ocv3, r.ocv4)).filter((v): v is number => v !== null);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const max = (arr: number[]) => arr.length ? Math.max(...arr) : null;
  const min = (arr: number[]) => arr.length ? Math.min(...arr) : null;

  const stats = {
    capacity: { avg: avg(capacityNums), max: max(capacityNums), min: min(capacityNums), stdev: stdevP(capacityNums) },
    acIr:     { avg: avg(acIrNums),     max: max(acIrNums),     min: min(acIrNums),     stdev: stdevP(acIrNums)     },
    ocv3:     { avg: avg(ocv3Nums),     max: max(ocv3Nums),     min: min(ocv3Nums),     stdev: stdevP(ocv3Nums)     },
    ocv4:     { avg: avg(ocv4Nums),     max: max(ocv4Nums),     min: min(ocv4Nums),     stdev: stdevP(ocv4Nums)     },
    deltaV:   { avg: avg(deltaVNums),   max: max(deltaVNums),   min: min(deltaVNums),   stdev: stdevP(deltaVNums)   },
  };

  const fmt2  = (v: number | null) => v === null ? '-' : v.toFixed(2);
  const fmt4  = (v: number | null) => v === null ? '-' : v.toFixed(4);
  const fmt3  = (v: number | null) => v === null ? '-' : v.toFixed(3);
  const fmt1dv = (v: number | null) => {
    if (v === null) return '-';
    if (v < 0) return `(${Math.abs(v).toFixed(1)})`;
    return v.toFixed(1);
  };

  const capacityLsl = specs['capacity']?.min;
  const acIrUsl     = specs['acIr']?.max;
  const ocv3Lsl     = specs['ocv3']?.min;
  const ocv4Lsl     = specs['ocv4']?.min;
  const ocv4Usl     = specs['ocv4']?.max;
  const deltaVUsl   = specs['deltaV']?.max;

  return (
    <>
      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <h3 className={styles.tableTitle}>● Grading</h3>
          <button className={styles.specButton} onClick={() => setIsSpecModalOpen(true)}>
            규격 설정
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <div
            ref={parentRef}
            style={{ height: TABLE_HEIGHT, overflowY: 'auto', position: 'relative' }}
          >
            <table className={styles.lqcTable} style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '60px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '200px' }} />
                <col style={{ width: '100px' }} />
              </colgroup>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#fff' }}>
                {/* 행1: 컬럼명 */}
                <tr>
                  <th rowSpan={2}>No.</th>
                  <th rowSpan={2}>Lot no.</th>
                  <th>기준용량</th>
                  <th>AC-IR</th>
                  <th>OCV3</th>
                  <th>OCV4</th>
                  <th>△V</th>
                </tr>
                {/* 행3: 단위 */}
                <tr>
                  <th>(Ah)</th>
                  <th>(mΩ)</th>
                  <th>(V)</th>
                  <th>(V)</th>
                  <th>(mV)</th>
                </tr>
                {/* 규격 행 */}
                <tr className={styles.specRow}>
                  <td colSpan={2}>규격</td>
                  <td>{formatSpec(specs['capacity'])}</td>
                  <td>{formatSpec(specs['acIr'])}</td>
                  <td>{formatSpec(specs['ocv3'])}</td>
                  <td>TBD</td>
                  <td>{formatSpec(specs['deltaV'])}</td>
                </tr>
                {/* 통계 행 */}
                {hasData && (
                  <>
                    <tr className={`${styles.summaryRow} ${styles.avgRow}`}>
                      <td colSpan={2}>Ave.</td>
                      <td>{fmt2(stats.capacity.avg)}</td>
                      <td>{fmt3(stats.acIr.avg)}</td>
                      <td>{fmt4(stats.ocv3.avg)}</td>
                      <td>{fmt4(stats.ocv4.avg)}</td>
                      <td>{fmt1dv(stats.deltaV.avg)}</td>
                    </tr>
                    <tr className={`${styles.summaryRow} ${styles.maxRow}`}>
                      <td colSpan={2}>Max.</td>
                      <td>{fmt2(stats.capacity.max)}</td>
                      <td>{fmt3(stats.acIr.max)}</td>
                      <td>{fmt4(stats.ocv3.max)}</td>
                      <td>{fmt4(stats.ocv4.max)}</td>
                      <td>{fmt1dv(stats.deltaV.max)}</td>
                    </tr>
                    <tr className={`${styles.summaryRow} ${styles.minRow}`}>
                      <td colSpan={2}>Min.</td>
                      <td>{fmt2(stats.capacity.min)}</td>
                      <td>{fmt3(stats.acIr.min)}</td>
                      <td>{fmt4(stats.ocv3.min)}</td>
                      <td>{fmt4(stats.ocv4.min)}</td>
                      <td style={stats.deltaV.min !== null && stats.deltaV.min < 0 ? { color: '#dc2626' } : undefined}>
                        {fmt1dv(stats.deltaV.min)}
                      </td>
                    </tr>
                    <tr className={`${styles.summaryRow} ${styles.stdevRow}`}>
                      <td colSpan={2}>Stdev.</td>
                      <td>{fmt2(stats.capacity.stdev)}</td>
                      <td>{fmt3(stats.acIr.stdev)}</td>
                      <td>{fmt4(stats.ocv3.stdev)}</td>
                      <td>{fmt4(stats.ocv4.stdev)}</td>
                      <td>{fmt1dv(stats.deltaV.stdev)}</td>
                    </tr>
                  </>
                )}
              </thead>
              <tbody>
                {!hasData ? (
                  <tr>
                    <td colSpan={7} className={styles.noDataRow}>데이터 없음</td>
                  </tr>
                ) : (
                  <>
                    <tr style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }}>
                      <td colSpan={7} style={{ padding: 0, border: 'none' }} />
                    </tr>
                    {virtualizer.getVirtualItems().map(virtualRow => {
                      const row = rows[virtualRow.index];
                      return (
                        <tr key={virtualRow.key} style={{ height: ROW_HEIGHT }}>
                          <td>{virtualRow.index + 1}</td>
                          <td>{row.lotNo}</td>
                          <td style={isOutOfSpec(row.capacity, capacityLsl, undefined) ? { color: '#dc2626' } : undefined}>
                            {row.capacity.toFixed(2)}
                          </td>
                          <td style={isOutOfSpec(row.acIr, undefined, acIrUsl) ? { color: '#dc2626' } : undefined}>
                            {row.acIr.toFixed(3)}
                          </td>
                          <td style={isOutOfSpec(row.ocv3, ocv3Lsl, undefined) ? { color: '#dc2626' } : undefined}>
                            {row.ocv3.toFixed(4)}
                          </td>
                          <td style={isOutOfSpec(row.ocv4, ocv4Lsl, ocv4Usl) ? { color: '#dc2626' } : undefined}>
                            {row.ocv4 !== null ? row.ocv4.toFixed(4) : '-'}
                          </td>
                          <td style={(() => {
                            const dv = calcDeltaV(row.ocv3, row.ocv4);
                            if (dv !== null && dv < 0) return { color: '#dc2626' };
                            if (dv !== null && dv > 3.0) return { background: '#FFFF00', color: '#000000' };
                            if (isOutOfSpec(dv, undefined, deltaVUsl)) return { color: '#dc2626' };
                            return undefined;
                          })()}>
                            {fmt1dv(calcDeltaV(row.ocv3, row.ocv4))}
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ height: virtualizer.getTotalSize() - (virtualizer.getVirtualItems().at(-1)?.end ?? 0) }}>
                      <td colSpan={7} style={{ padding: 0, border: 'none' }} />
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SpecEditModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onSave={handleSaveSpec}
        title="Grading"
        specs={specs}
        specFields={SPEC_FIELDS}
      />
    </>
  );
}
