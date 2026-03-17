import { useState } from 'react';
import styles from '../../../../styles/quality/lqc/LQCTable.module.css';
import PressCathodeTable from './PressCathodeTable';
import PressMeasurementTable, { type PressMeasurementRow } from './PressMeasurementTable';
import PressXbarChart from './PressXbarChart';
import PressRChart from './PressRChart';
import ControlChartConstantsTable from './ControlChartConstantsTable';

interface PressDashboardProps {
  projectId: number;
}

export default function PressDashboard({ projectId }: PressDashboardProps) {
  const [currentN, setCurrentN] = useState<number>(0);
  const [pressData, setPressData] = useState<PressMeasurementRow[]>([]);

  return (
    <div className={styles.tableContainer}>
      <PressCathodeTable projectId={projectId} />
      <PressMeasurementTable
        projectId={projectId}
        onNChange={setCurrentN}
        onDataChange={setPressData}
      />
      <PressXbarChart data={pressData} />
      <PressRChart data={pressData} />
      <ControlChartConstantsTable currentN={currentN} />
    </div>
  );
}
