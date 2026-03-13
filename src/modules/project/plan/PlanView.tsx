import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductionPlan } from '../../../api/project/plan';
import { exportPlanToStyledExcel } from './exportExcel';
import styles from '../../../styles/project/plan/PlanView.module.css';

interface Cell {
  month: number;
  week: number;
  text: string;
  active: boolean;
  colSpan: number;
}

interface ProcessData {
  group: string;
  name: string;
  type: string | null;
  key: string;
  hasElectrode: boolean;
  cells: Cell[];
}

interface WeekInfo {
  week: number;
  range: number[];
}

interface MonthHeader {
  month: number;
  weeks: WeekInfo[];
}

interface PlanResponse {
  id: number;
  startDate: string;
  endDate: string;
  production: {
    id: number;
    name: string;
    company: string;
    year: number;
  };
  weekHeaders: MonthHeader[];
  processes: ProcessData[];
}

export default function PlanView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productionId = id ? Number(id) : null;

  const [planData, setPlanData] = useState<PlanResponse | null>(null);

  useEffect(() => {
    if (!productionId) return;

    getProductionPlan(productionId).then(res => {
      let data = Array.isArray(res) ? res[0] : res;

      if (
        data.weekHeaders &&
        Array.isArray(data.weekHeaders) &&
        Array.isArray(data.weekHeaders[0]) &&
        'weeks' in data.weekHeaders[0][0]
      ) {
        data = {
          ...data,
          weekHeaders: data.weekHeaders.flat(),
        };
      }
      setPlanData(data);
    });
  }, [productionId]);

  if (!planData) return <p>📦 데이터를 불러오는 중...</p>;

  return (
    <div className={styles.planView}>
      <div className={styles.header}>
        <h3>📊 생산 일정 조회 - {planData.production?.name}</h3>
        <div className={styles.actions}>
          <button
            onClick={() => exportPlanToStyledExcel(planData!, planData.production?.name || 'Schedule')}
            className={styles.excelBtn}
          >
            📥 엑셀 다운로드
          </button>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            ← 목록으로
          </button>
        </div>
      </div>

      <table className={styles.planTable}>
        <thead>
          <tr>
            <th rowSpan={2} colSpan={3}>
              Process
            </th>
            {planData.weekHeaders.map(m => (
              <th key={m.month} colSpan={m.weeks.length}>
                {m.month}월
              </th>
            ))}
          </tr>
          <tr>
            {planData.weekHeaders.flatMap(m => m.weeks.map(w => <th key={`${m.month}-${w.week}`}>{w.week}w</th>))}
          </tr>
        </thead>

        <tbody>
          {planData.processes.map((row, idx) => {
            const prevRow = idx > 0 ? planData.processes[idx - 1] : null;
            const showGroup = !prevRow || prevRow.group !== row.group;
            const showName = row.hasElectrode && (!prevRow || prevRow.name !== row.name || prevRow.group !== row.group);
            const groupRowSpan = planData.processes.filter(r => r.group === row.group).length;
            const nameRowSpan = planData.processes.filter(r => r.name === row.name && r.group === row.group).length;

            return (
              <tr key={row.key}>
                {showGroup && <td rowSpan={groupRowSpan}>{row.group}</td>}

                {row.hasElectrode ? (
                  showName ? (
                    <td rowSpan={nameRowSpan}>{row.name}</td>
                  ) : null
                ) : (
                  <td colSpan={2}>{row.name}</td>
                )}

                {row.hasElectrode && <td>{row.type}</td>}

                {row.cells.map(cell => (
                  <td
                    key={`${cell.month}-${cell.week}-${cell.text}`}
                    colSpan={cell.colSpan}
                    className={cell.active ? styles.cellActive : styles.cellEmpty}
                  >
                    {cell.text}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
