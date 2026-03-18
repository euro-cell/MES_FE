import { useState } from 'react';
import SealingTopTable from './SealingTopTable';
import SealingMeasurementTable from './SealingMeasurementTable';
import SealingXbarChart from './SealingXbarChart';
import SealingRChart from './SealingRChart';
import ControlChartConstantsTable from '../common/ControlChartConstantsTable';
import type { SealingMeasurementRow } from './SealingMeasurementTable';
import styles from '../../../../../styles/quality/lqc/LQCTable.module.css';

interface SealingDashboardProps {
  projectId: number;
}

export default function SealingDashboard({ projectId }: SealingDashboardProps) {
  const [sideRows, setSideRows] = useState<SealingMeasurementRow[]>([]);
  const [topRows, setTopRows] = useState<SealingMeasurementRow[]>([]);

  return (
    <div className={styles.tableContainer}>
      <SealingTopTable projectId={projectId} />
      <SealingMeasurementTable
        projectId={projectId}
        onDataChange={setSideRows}
        onTopDataChange={setTopRows}
      />
      <SealingXbarChart
        title="Xbar 관리도 - Side Sealing"
        yMin={250}
        yMax={290}
        yStep={10}
        data={sideRows}
      />
      <SealingXbarChart
        title="Xbar 관리도 - Top Sealing"
        yMin={720}
        yMax={780}
        yStep={10}
        data={topRows}
      />
      <SealingRChart
        title="R 관리도 - Side Sealing"
        yMax={30}
        yStep={5}
        data={sideRows}
      />
      <SealingRChart
        title="R 관리도 - Top Sealing"
        yMax={25}
        yStep={5}
        data={topRows}
      />
      <ControlChartConstantsTable currentN={6} />
    </div>
  );
}
