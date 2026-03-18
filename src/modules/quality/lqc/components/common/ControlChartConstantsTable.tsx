import { useState } from 'react';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';

interface ControlChartConstant {
  n: number;
  A2: number;
  D4: number;
  D3: number;
}

interface ControlChartConstantsTableProps {
  currentN: number;
}

const CONTROL_CHART_CONSTANTS: ControlChartConstant[] = [
  { n:  2, A2: 1.880, D4: 3.267, D3: 0     },
  { n:  3, A2: 1.023, D4: 2.575, D3: 0     },
  { n:  4, A2: 0.729, D4: 2.282, D3: 0     },
  { n:  5, A2: 0.577, D4: 2.115, D3: 0     },
  { n:  6, A2: 0.483, D4: 2.004, D3: 0     },
  { n:  7, A2: 0.419, D4: 1.924, D3: 0.076 },
  { n:  8, A2: 0.373, D4: 1.864, D3: 0.136 },
  { n:  9, A2: 0.337, D4: 1.816, D3: 0.184 },
  { n: 10, A2: 0.308, D4: 1.777, D3: 0.223 },
  { n: 11, A2: 0.285, D4: 1.744, D3: 0.256 },
  { n: 12, A2: 0.266, D4: 1.717, D3: 0.284 },
  { n: 13, A2: 0.249, D4: 1.693, D3: 0.308 },
  { n: 14, A2: 0.235, D4: 1.672, D3: 0.329 },
  { n: 15, A2: 0.223, D4: 1.653, D3: 0.348 },
  { n: 16, A2: 0.212, D4: 1.637, D3: 0.364 },
  { n: 17, A2: 0.203, D4: 1.622, D3: 0.379 },
  { n: 18, A2: 0.194, D4: 1.609, D3: 0.392 },
  { n: 19, A2: 0.187, D4: 1.596, D3: 0.404 },
  { n: 20, A2: 0.180, D4: 1.585, D3: 0.414 },
  { n: 21, A2: 0.173, D4: 1.575, D3: 0.425 },
  { n: 22, A2: 0.167, D4: 1.565, D3: 0.435 },
  { n: 23, A2: 0.162, D4: 1.557, D3: 0.443 },
  { n: 24, A2: 0.157, D4: 1.548, D3: 0.452 },
  { n: 25, A2: 0.153, D4: 1.541, D3: 0.459 },
];

const calcE2 = (n: number, A2: number): number => Math.sqrt(n) * A2;

const fmt3 = (v: number) => v.toFixed(3);
const formatE2 = (v: number) => parseFloat(v.toPrecision(15)).toString();

export default function ControlChartConstantsTable({ currentN }: ControlChartConstantsTableProps) {
  const current = CONTROL_CHART_CONSTANTS.find(c => c.n === currentN);
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.tableSection}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setOpen(o => !o)}
      >
        <h3 className={styles.tableTitle} style={{ margin: 0 }}>※ UCL, LCL 산출시 상수값 도표</h3>
        <button
          type="button"
          style={{
            padding: '6px 16px',
            fontSize: 13,
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            background: '#f1f5f9',
            color: '#334155',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {open ? '▲ 접기' : '▼ 펼치기'}
        </button>
      </div>

      {/* 상단 패널 — 현재 n 조회 결과 */}
      {current && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{
            backgroundColor: '#B5E6A2',
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '8px 20px',
            textAlign: 'center',
            minWidth: 80,
          }}>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>A2</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt3(current.A2)}</div>
          </div>
          <div style={{
            backgroundColor: '#E49EDD',
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '8px 20px',
            textAlign: 'center',
            minWidth: 80,
          }}>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>D4</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt3(current.D4)}</div>
          </div>
          <div style={{
            backgroundColor: '#94DCF8',
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '8px 20px',
            textAlign: 'center',
            minWidth: 80,
          }}>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 2 }}>D3</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {currentN <= 6 ? '-' : fmt3(current.D3)}
            </div>
          </div>
          <div style={{ alignSelf: 'center', color: '#64748b', fontSize: 13 }}>
            (n = {currentN} 기준)
          </div>
        </div>
      )}

      {/* 전체 계수 도표 */}
      {open && <div className={styles.tableWrapper}>
        <table className={styles.lqcTable}>
          <thead>
            <tr style={{ backgroundColor: '#FFFF00' }}>
              <th style={{ backgroundColor: '#FFFF00' }}>n</th>
              <th style={{ backgroundColor: '#FFFF00' }}>A2</th>
              <th style={{ backgroundColor: '#FFFF00' }}>D4</th>
              <th style={{ backgroundColor: '#FFFF00' }}>D3</th>
              <th style={{ backgroundColor: '#FFFF00' }}>E2</th>
            </tr>
          </thead>
          <tbody>
            {CONTROL_CHART_CONSTANTS.map(c => {
              const isActive = c.n === currentN;
              return (
                <tr
                  key={c.n}
                  style={isActive ? {
                    outline: '2px solid #333',
                    outlineOffset: '-2px',
                    backgroundColor: '#fffde7',
                    fontWeight: 700,
                  } : undefined}
                >
                  <td>{c.n}</td>
                  <td>{fmt3(c.A2)}</td>
                  <td>{fmt3(c.D4)}</td>
                  <td>{c.n <= 6 ? fmt3(0) : fmt3(c.D3)}</td>
                  <td><em>{formatE2(calcE2(c.n, c.A2))}</em></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>}
    </div>
  );
}
